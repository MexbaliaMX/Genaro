/**
 * Genaro DFT 2.0 - Signal Processor
 * 
 * Processes and aggregates signals from various sources
 */

export interface Signal {
  type: string;
  value: any;
  confidence: number;
  model: string;
  timestamp: string;
}

export interface AggregatedSignals {
  sentiment: {
    value: number;
    confidence: number;
    model: string;
  };
  toxicity: {
    value: number;
    confidence: number;
    model: string;
  };
  emotions: string[];
  stance: string | null;
  quality: number;
  integrity_flags: any[];
}

export class SignalProcessor {
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    console.log('Initializing Signal Processor...');
    this.initialized = true;
    console.log('Signal Processor initialized');
  }

  /**
   * Aggregate multiple signals for a single artifact
   */
  async aggregateSignals(signals: Signal[]): Promise<AggregatedSignals> {
    if (!this.initialized) {
      throw new Error('SignalProcessor not initialized');
    }

    // Group signals by type
    const groupedSignals: Record<string, Signal[]> = {};
    for (const signal of signals) {
      if (!groupedSignals[signal.type]) {
        groupedSignals[signal.type] = [];
      }
      groupedSignals[signal.type].push(signal);
    }

    // Process each signal type
    const aggregated: AggregatedSignals = {
      sentiment: this.aggregateSentimentSignals(groupedSignals.sentiment || []),
      toxicity: this.aggregateToxicitySignals(groupedSignals.toxicity || []),
      emotions: this.aggregateEmotionSignals(groupedSignals.emotions || []),
      stance: this.aggregateStanceSignals(groupedSignals.stance || []),
      quality: this.calculateQualityScore(groupedSignals),
      integrity_flags: this.aggregateIntegrityFlags(groupedSignals)
    };

    return aggregated;
  }

  private aggregateSentimentSignals(sentimentSignals: Signal[]): AggregatedSignals['sentiment'] {
    if (sentimentSignals.length === 0) {
      return {
        value: 0,
        confidence: 0,
        model: 'default'
      };
    }

    // Weighted average based on confidence
    let weightedSum = 0;
    let totalConfidence = 0;
    let latestModel = sentimentSignals[0].model;

    for (const signal of sentimentSignals) {
      weightedSum += signal.value * signal.confidence;
      totalConfidence += signal.confidence;
      latestModel = signal.model; // Keep track of the model used
    }

    const avgValue = totalConfidence > 0 ? weightedSum / totalConfidence : 0;
    // Average confidence of all signals
    const avgConfidence = sentimentSignals.reduce((sum, s) => sum + s.confidence, 0) / sentimentSignals.length;

    return {
      value: Math.min(Math.max(avgValue, -1), 1), // Clamp between -1 and 1
      confidence: avgConfidence,
      model: latestModel
    };
  }

  private aggregateToxicitySignals(toxicitySignals: Signal[]): AggregatedSignals['toxicity'] {
    if (toxicitySignals.length === 0) {
      return {
        value: 0,
        confidence: 0,
        model: 'default'
      };
    }

    // Weighted average based on confidence
    let weightedSum = 0;
    let totalConfidence = 0;
    let latestModel = toxicitySignals[0].model;

    for (const signal of toxicitySignals) {
      weightedSum += signal.value * signal.confidence;
      totalConfidence += signal.confidence;
      latestModel = signal.model;
    }

    const avgValue = totalConfidence > 0 ? weightedSum / totalConfidence : 0;
    const avgConfidence = toxicitySignals.reduce((sum, s) => sum + s.confidence, 0) / toxicitySignals.length;

    return {
      value: Math.min(avgValue, 1), // Clamp at 1.0 (100% toxicity)
      confidence: avgConfidence,
      model: latestModel
    };
  }

  private aggregateEmotionSignals(emotionSignals: Signal[]): string[] {
    // In the current implementation, emotions are handled differently
    // This would aggregate emotions from multiple sources if needed
    const emotionsSet = new Set<string>();
    
    for (const signal of emotionSignals) {
      if (Array.isArray(signal.value)) {
        for (const emotion of signal.value) {
          emotionsSet.add(emotion);
        }
      } else if (typeof signal.value === 'string') {
        emotionsSet.add(signal.value);
      }
    }

    return Array.from(emotionsSet);
  }

  private aggregateStanceSignals(stanceSignals: Signal[]): string | null {
    if (stanceSignals.length === 0) {
      return null;
    }

    // For stance, we'll take the value from the most recent signal
    return stanceSignals[stanceSignals.length - 1].value as string;
  }

  private calculateQualityScore(allSignals: Record<string, Signal[]>): number {
    // Calculate an overall quality score based on signal confidence and consistency
    let totalConfidence = 0;
    let signalCount = 0;

    for (const signals of Object.values(allSignals)) {
      for (const signal of signals) {
        totalConfidence += signal.confidence;
        signalCount++;
      }
    }

    if (signalCount === 0) {
      return 0.5; // Default quality if no signals
    }

    return totalConfidence / signalCount;
  }

  private aggregateIntegrityFlags(allSignals: Record<string, Signal[]>): any[] {
    // Aggregate integrity flags from various signals
    const integrityFlags: any[] = [];

    // Process any special signals related to integrity
    if (allSignals.integrity_flags) {
      for (const signal of allSignals.integrity_flags) {
        integrityFlags.push(...(signal.value || []));
      }
    }

    // Add any other integrity-related indicators
    if (allSignals.deepfake_risk) {
      for (const signal of allSignals.deepfake_risk) {
        if (signal.value > 0.7) { // High risk threshold
          integrityFlags.push({
            type: 'deepfake_risk',
            score: signal.value,
            confidence: signal.confidence,
            explanation: 'High probability of synthetic media'
          });
        }
      }
    }

    return integrityFlags;
  }

  /**
   * Detect potential conflicts or inconsistencies in signals
   */
  detectSignalConflicts(aggregateSignals: AggregatedSignals): string[] {
    const conflicts: string[] = [];

    // Example: Check if sentiment and emotions are conflicting
    if (aggregateSignals.sentiment.value > 0.5 && 
        aggregateSignals.emotions.includes('anger')) {
      conflicts.push('Positive sentiment conflicts with detected anger emotion');
    }

    return conflicts;
  }

  async cleanup(): Promise<void> {
    console.log('Cleaning up Signal Processor...');
    this.initialized = false;
    console.log('Signal Processor cleaned up');
  }
}