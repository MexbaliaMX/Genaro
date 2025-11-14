/**
 * Genaro DFT 2.0 - Analytics Agent
 * 
 * Specialized agent for correlating reputational, financial, and narrative datasets
 * Surfaces probabilistic scenario forecasts with confidence bands
 * Feeds prescriptive models with structured risk and ROI projections
 */

import { Agent } from './base-agent';
import { EventBus } from '../integration_layer/event_bus/event-bus';
import { ForecastingEngine } from '../analytics/forecasting-engine';
import { NarrativeCorrelationEngine } from '../analytics/narrative-correlation-engine';
import { RiskScoringEngine } from '../analytics/risk-scoring-engine';

export interface AnalyticsConfig {
  forecastingModels: {
    temporalFusionTransformer: string;
    prophetBaseline: string;
    viralityClassifier: string;
  };
  correlationThreshold: number;
  riskModels: {
    narrativeCapture: string;
    financialImpact: string;
  };
  confidenceThreshold: number;
}

export class AnalyticsAgent extends Agent {
  private config: AnalyticsConfig;
  private eventBus: EventBus;
  private forecastingEngine: ForecastingEngine;
  private correlationEngine: NarrativeCorrelationEngine;
  private riskScoringEngine: RiskScoringEngine;

  constructor(config: AnalyticsConfig) {
    super('analytics-agent');
    this.config = config;
    this.eventBus = new EventBus();
    this.forecastingEngine = new ForecastingEngine();
    this.correlationEngine = new NarrativeCorrelationEngine();
    this.riskScoringEngine = new RiskScoringEngine();
  }

  async initialize(): Promise<void> {
    console.log('Initializing Analytics Agent...');
    
    // Initialize all engines
    await this.forecastingEngine.initialize();
    await this.correlationEngine.initialize();
    await this.riskScoringEngine.initialize();
    
    // Connect to event bus and subscribe to relevant topics
    await this.eventBus.connect();
    
    // Subscribe to signals and narrative updates
    await this.eventBus.subscribe('signal.perception.analyzed', this.processSignals.bind(this));
    await this.eventBus.subscribe('narrative.detected', this.processNarrative.bind(this));
    
    console.log('Analytics Agent initialized successfully');
  }

  /**
   * Process incoming signals to identify correlations and patterns
   */
  async processSignals(signalData: any): Promise<void> {
    try {
      console.log(`Processing signals for analytics: ${signalData.artifact_id}`);
      
      // Correlate signals with existing narratives
      const correlations = await this.correlationEngine.correlateSignals(signalData);
      
      // Update narrative models with new signal data
      await this.updateNarrativeModels(signalData, correlations);
      
      // Perform forecasting based on new signals
      if (correlations.length > 0) {
        const forecasts = await this.forecastingEngine.generateForecasts(correlations);
        
        // Publish forecast results
        await this.eventBus.publish('forecast.generated', {
          forecasts,
          source: this.getId(),
          timestamp: new Date().toISOString()
        });
      }
      
      console.log(`Analytics processing completed for ${signalData.artifact_id}`);
    } catch (error) {
      console.error(`Error in analytics processing for ${signalData.artifact_id}:`, error);
      throw error;
    }
  }

  /**
   * Process new narrative detection events
   */
  async processNarrative(narrativeData: any): Promise<void> {
    try {
      console.log(`Processing narrative for analytics: ${narrativeData.narrative_id}`);
      
      // Perform risk assessment on new narrative
      const riskAssessment = await this.riskScoringEngine.assessNarrativeRisk(narrativeData);
      
      // Generate forecast for the new narrative
      const forecasts = await this.forecastingEngine.generateNarrativeForecast(narrativeData);
      
      // Correlate with other data sources if available
      const correlations = await this.correlationEngine.correlateNarrative(narrativeData);
      
      // Publish comprehensive analytics results
      await this.eventBus.publish('analytics.results', {
        narrative_id: narrativeData.narrative_id,
        risk_assessment: riskAssessment,
        forecasts: forecasts,
        correlations: correlations,
        source: this.getId(),
        timestamp: new Date().toISOString()
      });
      
      console.log(`Analytics processing completed for narrative ${narrativeData.narrative_id}`);
    } catch (error) {
      console.error(`Error in narrative analytics for ${narrativeData.narrative_id}:`, error);
      throw error;
    }
  }

  /**
   * Update narrative models with new signal data
   */
  private async updateNarrativeModels(signalData: any, correlations: any[]): Promise<void> {
    for (const correlation of correlations) {
      // Update the forecasting models with new data
      await this.forecastingEngine.updateModel(correlation.narrative_id, {
        signal_data: signalData,
        correlation_score: correlation.score,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Generate comprehensive risk and opportunity matrix
   */
  async generateRiskOpportunityMatrix(): Promise<any> {
    // This would aggregate all risk assessments and opportunities identified
    const allRiskAssessments = await this.riskScoringEngine.getAllRiskAssessments();
    const allForecasts = await this.forecastingEngine.getAllForecasts();
    
    // Create a ranked matrix of opportunities and risks
    const matrix = {
      risks: this.rankRisks(allRiskAssessments),
      opportunities: this.rankOpportunities(allForecasts),
      timestamp: new Date().toISOString()
    };
    
    // Publish the matrix for prescriptive engine
    await this.eventBus.publish('risk-opportunity.matrix', matrix);
    
    return matrix;
  }

  /**
   * Rank risks by probability and impact
   */
  private rankRisks(riskAssessments: any[]): any[] {
    return riskAssessments
      .map(assessment => ({
        ...assessment,
        composite_score: assessment.probability * assessment.impact
      }))
      .sort((a, b) => b.composite_score - a.composite_score);
  }

  /**
   * Rank opportunities by probability of success and potential impact
   */
  private rankOpportunities(forecasts: any[]): any[] {
    return forecasts
      .map(forecast => ({
        ...forecast,
        opportunity_score: forecast.likelihood * forecast.positive_impact
      }))
      .sort((a, b) => b.opportunity_score - a.opportunity_score);
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down Analytics Agent...');
    
    // Disconnect from event bus
    await this.eventBus.disconnect();
    
    // Clean up engines
    await this.forecastingEngine.cleanup();
    await this.correlationEngine.cleanup();
    await this.riskScoringEngine.cleanup();
    
    console.log('Analytics Agent shut down successfully');
  }
}