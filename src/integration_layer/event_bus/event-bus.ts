/**
 * Genaro DFT 2.0 Event Bus Configuration
 * 
 * Defines the Kafka topics and schema registry configurations
 * based on the AsyncAPI specification.
 */

import { Kafka, Producer } from 'kafkajs';
import Ajv, { JSONSchemaType } from 'ajv';

// Define the schema types based on the AsyncAPI specification
interface RawContentIngested {
  source: string;
  external_id: string;
  fetched_at: string; // ISO 8601 format
  payload: any;
}

interface Artifact {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio';
  text?: string | null;
  media?: {
    url: string;
    kind: string;
  }[];
  lang?: string;
  created_at: string; // ISO 8601 format
  actor_id?: string;
}

interface Channel {
  platform: string;
  topic: string;
}

interface CanonicalContentNormalized {
  artifact: Artifact;
  channel: Channel;
  metadata?: any;
}

interface SignalPayload {
  value: number;
  confidence?: number;
  model?: string;
}

interface Signals {
  sentiment?: SignalPayload;
  toxicity?: SignalPayload;
}

interface SignalSentimentScored {
  artifact_id: string;
  signals: Signals;
}

interface Evidence {
  artifact_id: string;
  score: number;
  url?: string;
  snippet?: string;
}

interface NarrativeRiskDetected {
  narrative_id: string;
  risk_level: 'low' | 'moderate' | 'high' | 'critical';
  explanation?: string;
  evidence: Evidence[];
}

// JSON Schemas for validation
const rawContentIngestedSchema: JSONSchemaType<RawContentIngested> = {
  type: 'object',
  properties: {
    source: { type: 'string' },
    external_id: { type: 'string' },
    fetched_at: { type: 'string', format: 'date-time' },
    payload: { type: 'object', additionalProperties: true }
  },
  required: ['source', 'external_id', 'fetched_at', 'payload'],
  additionalProperties: false
};

const canonicalContentNormalizedSchema: JSONSchemaType<CanonicalContentNormalized> = {
  type: 'object',
  properties: {
    artifact: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        type: { type: 'string', enum: ['text', 'image', 'video', 'audio'] },
        text: { type: 'string', nullable: true },
        media: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              kind: { type: 'string' }
            },
            required: ['url', 'kind']
          }
        },
        lang: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        actor_id: { type: 'string' }
      },
      required: ['id', 'type', 'created_at']
    },
    channel: {
      type: 'object',
      properties: {
        platform: { type: 'string' },
        topic: { type: 'string' }
      },
      required: ['platform', 'topic']
    },
    metadata: { type: 'object', additionalProperties: true }
  },
  required: ['artifact', 'channel'],
  additionalProperties: false
};

const signalSentimentScoredSchema: JSONSchemaType<SignalSentimentScored> = {
  type: 'object',
  properties: {
    artifact_id: { type: 'string' },
    signals: {
      type: 'object',
      properties: {
        sentiment: {
          type: 'object',
          properties: {
            value: { type: 'number' },
            confidence: { type: 'number' },
            model: { type: 'string' }
          },
          required: ['value']
        },
        toxicity: {
          type: 'object',
          properties: {
            value: { type: 'number' }
          },
          required: ['value']
        }
      }
    }
  },
  required: ['artifact_id', 'signals']
};

const narrativeRiskDetectedSchema: JSONSchemaType<NarrativeRiskDetected> = {
  type: 'object',
  properties: {
    narrative_id: { type: 'string' },
    risk_level: { type: 'string', enum: ['low', 'moderate', 'high', 'critical'] },
    explanation: { type: 'string' },
    evidence: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          artifact_id: { type: 'string' },
          score: { type: 'number' },
          url: { type: 'string' },
          snippet: { type: 'string' }
        },
        required: ['artifact_id', 'score']
      }
    }
  },
  required: ['narrative_id', 'risk_level', 'evidence']
};

// Event Bus class
class EventBus {
  private kafka: Kafka;
  private producer: Producer;
  private ajv: Ajv;
  private validators: Record<string, (data: any) => boolean>;

  constructor(brokers: string[] = ['localhost:9092']) {
    this.kafka = new Kafka({
      clientId: 'genaro-event-bus',
      brokers
    });
    
    this.producer = this.kafka.producer();
    this.ajv = new Ajv();
    
    // Compile validators
    this.validators = {
      'raw.content.ingested': this.ajv.compile(rawContentIngestedSchema),
      'canon.content.normalized': this.ajv.compile(canonicalContentNormalizedSchema),
      'signal.sentiment.scored': this.ajv.compile(signalSentimentScoredSchema),
      'risk.narrative.detected': this.ajv.compile(narrativeRiskDetectedSchema)
    };
  }

  async connect() {
    await this.producer.connect();
  }

  async disconnect() {
    await this.producer.disconnect();
  }

  // Validate data against schema
  validate(topic: string, data: any): boolean {
    const validator = this.validators[topic];
    if (!validator) {
      console.warn(`No validator found for topic: ${topic}`);
      return true; // Allow unknown topics for flexibility
    }
    return validator(data);
  }

  // Publish message to a topic with validation
  async publish(topic: string, data: any): Promise<void> {
    if (!this.validate(topic, data)) {
      throw new Error(`Validation failed for topic ${topic}`);
    }

    await this.producer.send({
      topic,
      messages: [
        { value: JSON.stringify(data) }
      ]
    });
  }

  // Create a consumer for a topic
  async createConsumer(groupId: string, topics: string[]) {
    const consumer = this.kafka.consumer({ groupId });
    
    await consumer.connect();
    
    // Subscribe to all topics
    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: true });
    }
    
    return consumer;
  }
  
  // Define standard topics
  getTopics(): string[] {
    return [
      'raw.content.ingested',
      'raw.ad_spend.ingested',
      'canon.content.normalized',
      'signal.sentiment.scored',
      'signal.toxicity.scored',
      'risk.narrative.detected',
      'alert.threshold.breached',
      'insight.narrative.summary',
      'insight.recommendation.action'
    ];
  }
}

// Initialize the event bus
const eventBus = new EventBus();

export {
  eventBus,
  EventBus,
  RawContentIngested,
  CanonicalContentNormalized,
  SignalSentimentScored,
  NarrativeRiskDetected,
  rawContentIngestedSchema,
  canonicalContentNormalizedSchema,
  signalSentimentScoredSchema,
  narrativeRiskDetectedSchema
};
