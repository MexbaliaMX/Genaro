/**
 * Genaro DFT 2.0 Processing Layer
 * 
 * Implements the Feature Store, batch/streaming jobs, and Rules Engine
 * as per the integration layer architecture.
 */

import { 
  eventBus, 
  CanonicalContentNormalized, 
  SignalSentimentScored, 
  NarrativeRiskDetected 
} from '../event_bus/event-bus';

// Feature Store interface
interface FeatureStore {
  getFeatures(artifactId: string): Promise<any>;
  storeFeature(artifactId: string, featureType: string, value: any): Promise<void>;
  getBatchFeatures(artifactIds: string[], featureTypes: string[]): Promise<Map<string, any>>;
}

// Mock implementation of Feature Store
class MockFeatureStore implements FeatureStore {
  private features: Map<string, Map<string, any>> = new Map(); // artifactId -> { featureType -> value }
  
  async getFeatures(artifactId: string): Promise<any> {
    const artifactFeatures = this.features.get(artifactId);
    return artifactFeatures ? Object.fromEntries(artifactFeatures) : {};
  }
  
  async storeFeature(artifactId: string, featureType: string, value: any): Promise<void> {
    if (!this.features.has(artifactId)) {
      this.features.set(artifactId, new Map());
    }
    this.features.get(artifactId)!.set(featureType, value);
  }
  
  async getBatchFeatures(artifactIds: string[], featureTypes: string[]): Promise<Map<string, any>> {
    const result = new Map<string, any>();
    
    for (const artifactId of artifactIds) {
      const artifactFeatures = await this.getFeatures(artifactId);
      const selectedFeatures: any = {};
      
      for (const featureType of featureTypes) {
        if (artifactFeatures[featureType] !== undefined) {
          selectedFeatures[featureType] = artifactFeatures[featureType];
        }
      }
      
      result.set(artifactId, selectedFeatures);
    }
    
    return result;
  }
}

// Rules Engine interface
interface RulesEngine {
  evaluate(artifact: CanonicalContentNormalized, signals: SignalSentimentScored): Promise<RiskDetectionResult[]>;
  addRule(rule: Rule): void;
  removeRule(ruleId: string): void;
}

interface Rule {
  id: string;
  description: string;
  condition: (artifact: CanonicalContentNormalized, signals: SignalSentimentScored) => boolean;
  action: (artifact: CanonicalContentNormalized, signals: SignalSentimentScored) => any;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
}

interface RiskDetectionResult {
  ruleId: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  explanation: string;
  evidence: any[];
}

// Implementation of Rules Engine
class GenaroRulesEngine implements RulesEngine {
  private rules: Map<string, Rule> = new Map();
  
  constructor() {
    // Initialize with default rules
    this.initializeDefaultRules();
  }
  
  private initializeDefaultRules() {
    // Rule 1: High negative sentiment
    this.addRule({
      id: 'high_neg_sentiment',
      description: 'Flag content with very negative sentiment',
      condition: (artifact, signals) => {
        const sentiment = signals.signals.sentiment;
        return sentiment && sentiment.value < -0.6 && sentiment.confidence > 0.7;
      },
      action: (artifact, signals) => ({
        type: 'sentiment',
        value: signals.signals.sentiment?.value
      }),
      riskLevel: 'high'
    });
    
    // Rule 2: High toxicity
    this.addRule({
      id: 'high_toxicity',
      description: 'Flag content with high toxicity',
      condition: (artifact, signals) => {
        const toxicity = signals.signals.toxicity;
        return toxicity && toxicity.value > 0.8;
      },
      action: (artifact, signals) => ({
        type: 'toxicity',
        value: signals.signals.toxicity?.value
      }),
      riskLevel: 'high'
    });
    
    // Rule 3: Rapid escalation (multiple mentions in short time)
    this.addRule({
      id: 'rapid_escalation',
      description: 'Flag potential viral content based on volume',
      condition: (artifact, signals) => {
        // In a real implementation, this would check velocity metrics
        // For now, we'll simulate based on some criteria
        return artifact.artifact.text?.length > 100 && 
               artifact.artifact.lang === 'en' &&
               signals.signals.sentiment?.value < -0.3;
      },
      action: (artifact, signals) => ({
        type: 'velocity',
        factor: 'high volume'
      }),
      riskLevel: 'moderate'
    });
  }
  
  async evaluate(artifact: CanonicalContentNormalized, signals: SignalSentimentScored): Promise<RiskDetectionResult[]> {
    const results: RiskDetectionResult[] = [];
    
    for (const rule of this.rules.values()) {
      try {
        if (rule.condition(artifact, signals)) {
          const evidence = rule.action(artifact, signals);
          results.push({
            ruleId: rule.id,
            riskLevel: rule.riskLevel,
            explanation: rule.description,
            evidence: [evidence]
          });
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
      }
    }
    
    return results;
  }
  
  addRule(rule: Rule): void {
    this.rules.set(rule.id, rule);
    console.log(`Rule added: ${rule.description}`);
  }
  
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    console.log(`Rule removed: ${ruleId}`);
  }
}

// Batch/Stream processing service
class BatchStreamProcessor {
  private featureStore: FeatureStore;
  private rulesEngine: RulesEngine;
  
  constructor(featureStore: FeatureStore, rulesEngine: RulesEngine) {
    this.featureStore = featureStore;
    this.rulesEngine = rulesEngine;
  }
  
  async processSignalsBatch(signals: SignalSentimentScored[]): Promise<void> {
    // In a real implementation, this would process batches of signals
    // and update the feature store and trigger rules evaluation
    
    for (const signal of signals) {
      try {
        // Retrieve associated artifact from canonical store
        // For this mock implementation, we'll skip this step
        // and just update the feature store with the signal
        
        await this.featureStore.storeFeature(
          signal.artifact_id,
          'sentiment',
          signal.signals.sentiment
        );
        
        await this.featureStore.storeFeature(
          signal.artifact_id,
          'toxicity',
          signal.signals.toxicity
        );
        
        console.log(`Features updated for artifact: ${signal.artifact_id}`);
      } catch (error) {
        console.error(`Error processing signal for ${signal.artifact_id}:`, error);
      }
    }
  }
  
  async processNarrativeRisk(artifact: CanonicalContentNormalized, signals: SignalSentimentScored): Promise<void> {
    // Evaluate rules for this artifact
    const riskResults = await this.rulesEngine.evaluate(artifact, signals);
    
    if (riskResults.length > 0) {
      // Determine the highest risk level
      const highestRisk = riskResults.reduce((highest, current) => {
        const riskLevels = { 'low': 1, 'moderate': 2, 'high': 3, 'critical': 4 };
        return riskLevels[current.riskLevel] > riskLevels[highest.riskLevel] ? current : highest;
      }, riskResults[0]);
      
      // Create risk detection event
      const riskDetection: NarrativeRiskDetected = {
        narrative_id: `nar_${artifact.artifact.id.substring(0, 8)}`, // Mock narrative ID
        risk_level: highestRisk.riskLevel,
        explanation: highestRisk.explanation,
        evidence: [
          {
            artifact_id: artifact.artifact.id,
            score: signals.signals.sentiment?.value || 0,
            snippet: artifact.artifact.text?.substring(0, 100)
          }
        ]
      };
      
      // Publish risk detection event
      await eventBus.publish('risk.narrative.detected', riskDetection);
      
      console.log(`Risk detected for artifact ${artifact.artifact.id}: ${highestRisk.riskLevel}`);
    }
  }
}

// Initialize services
const featureStore = new MockFeatureStore();
const rulesEngine = new GenaroRulesEngine();
const processor = new BatchStreamProcessor(featureStore, rulesEngine);

// Start listening for signals to process
async function startProcessingService() {
  console.log('Starting processing service...');
  
  // Subscribe to signals to update features and evaluate rules
  const signalConsumer = await eventBus.createConsumer(
    'processor-group',
    ['signal.sentiment.scored']
  );
  
  // Create a separate consumer for canonical content to correlate with signals
  const canonicalConsumer = await eventBus.createConsumer(
    'correlation-group',
    ['canon.content.normalized']
  );
  
  // Map to temporarily store canonical content for correlation
  const canonicalMap = new Map<string, CanonicalContentNormalized>();
  
  // Process canonical content
  canonicalConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (message.value) {
        try {
          const canonical: CanonicalContentNormalized = JSON.parse(message.value.toString());
          // Store temporarily for correlation with signals
          canonicalMap.set(canonical.artifact.id, canonical);
          
          // Keep only recent items to prevent memory issues
          if (canonicalMap.size > 1000) {
            const firstKey = canonicalMap.keys().next().value;
            canonicalMap.delete(firstKey);
          }
        } catch (error) {
          console.error('Error processing canonical content:', error);
        }
      }
    }
  }).catch(error => {
    console.error('Canonical consumer error:', error);
  });
  
  // Process signals and correlate with canonical content
  signalConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (message.value) {
        try {
          const signal: SignalSentimentScored = JSON.parse(message.value.toString());
          
          // Process the signal batch update
          await processor.processSignalsBatch([signal]);
          
          // Get the associated canonical content for risk evaluation
          const canonical = canonicalMap.get(signal.artifact_id);
          if (canonical) {
            await processor.processNarrativeRisk(canonical, signal);
          } else {
            // If canonical content is not available yet, we could implement
            // a retry mechanism or buffer the signal for later processing
            console.log(`Canonical content not found for ${signal.artifact_id}, buffering...`);
            // In a real implementation, you might want to buffer these signals
          }
        } catch (error) {
          console.error('Error processing signal:', error);
        }
      }
    }
  }).catch(error => {
    console.error('Signal consumer error:', error);
  });
}

export {
  FeatureStore,
  MockFeatureStore,
  RulesEngine,
  GenaroRulesEngine,
  Rule,
  RiskDetectionResult,
  BatchStreamProcessor,
  startProcessingService
};
