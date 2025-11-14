/**
 * Genaro DFT 2.0 Connector SDK
 * 
 * Provides a standard interface for creating data connectors
 * that follow the DFT Canonical Model and integrate with the event bus.
 */

import { Kafka, KafkaConfig, Producer, Consumer } from 'kafkajs';
import axios from 'axios';

// Interfaces based on the DFT Canonical Model
export interface Actor {
  id: string;
  handle: string;
  platform: string;
  verified?: boolean;
  org?: string;
  geo?: string;
}

export interface Media {
  url: string;
  kind: string; // 'image', 'video', 'audio', etc.
}

export interface Artifact {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio';
  text?: string;
  media?: Media[];
  lang?: string;
  created_at: string;
  actor_id?: string;
  source_ref?: string;
}

export interface Channel {
  platform: string;
  topic: string;
  community_id?: string;
}

export interface RawPayload {
  source: string;
  external_id: string;
  fetched_at: string;
  payload: any;
}

export interface CanonicalPayload {
  artifact: Artifact;
  channel: Channel;
  metadata?: any;
}

// Connector interface based on the specification
export interface Connector {
  // Main methods for fetching and mapping data
  poll(): Promise<RawPayload[]>;
  subscribe?(handler: (raw: RawPayload) => void): void;
  mapToCanonical(raw: RawPayload): Promise<CanonicalPayload>;
  
  // Lifecycle methods
  initialize(): Promise<void>;
  validateConfig(): Promise<boolean>;
  
  // Checkpointing for idempotency
  checkpoint(commit: boolean): Promise<void>;
  
  // Error handling and retry logic
  handleRetry(error: any, payload: RawPayload): Promise<void>;
}

// Base class for connectors
export abstract class BaseConnector implements Connector {
  protected config: any;
  protected producer: Producer;
  protected consumer: Consumer;
  protected kafka: Kafka;
  
  constructor(config: any) {
    this.config = config;
    const kafkaConfig: KafkaConfig = {
      clientId: config.clientId || 'genaro-connector-sdk',
      brokers: config.brokers || ['localhost:9092']
    };
    this.kafka = new Kafka(kafkaConfig);
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: config.groupId || 'genaro-connectors' });
  }
  
  async initialize(): Promise<void> {
    await this.producer.connect();
    if (this.subscribe) {
      await this.consumer.connect();
    }
    console.log(`Connector ${this.constructor.name} initialized`);
  }
  
  async validateConfig(): Promise<boolean> {
    // Basic validation of required config
    return !!this.config.source && !!this.config.brokers;
  }
  
  abstract poll(): Promise<RawPayload[]>;
  abstract mapToCanonical(raw: RawPayload): Promise<CanonicalPayload>;
  
  async checkpoint(commit: boolean): Promise<void> {
    if (commit) {
      // Commit the last processed message offset
      console.log('Checkpoint committed');
    } else {
      // Reset to last committed offset
      console.log('Checkpoint reset');
    }
  }
  
  async handleRetry(error: any, payload: RawPayload): Promise<void> {
    console.warn(`Handling retry for payload: ${payload.external_id}`, error);
    // Implement exponential backoff and retry logic
    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, payload.retryCount || 0)));
  }
  
  async publishToTopic(topic: string, message: any): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        { value: JSON.stringify(message) }
      ]
    });
  }
  
  async subscribeToTopic(topic: string, handler: (message: any) => void): Promise<void> {
    await this.consumer.subscribe({ topic, fromBeginning: true });
    
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (message.value) {
          const parsedMessage = JSON.parse(message.value.toString());
          handler(parsedMessage);
        }
      }
    });
  }
  
  async close(): Promise<void> {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }
}

// Connector factory to help with creation
export class ConnectorFactory {
  static create<T extends BaseConnector>(connectorClass: new (config: any) => T, config: any): T {
    return new connectorClass(config);
  }
}

// Example implementation of a basic connector
export class ExampleConnector extends BaseConnector {
  async poll(): Promise<RawPayload[]> {
    // Simulate fetching data from an external API
    const response = await axios.get(this.config.apiUrl);
    const data = response.data;
    
    // Convert to RawPayload format
    const payloads: RawPayload[] = data.map((item: any) => ({
      source: this.config.source,
      external_id: item.id,
      fetched_at: new Date().toISOString(),
      payload: item
    }));
    
    return payloads;
  }
  
  async mapToCanonical(raw: RawPayload): Promise<CanonicalPayload> {
    // Map raw payload to canonical model
    const canonical: CanonicalPayload = {
      artifact: {
        id: `art_${raw.external_id}`,
        type: 'text', // Default type, could be determined from raw payload
        text: raw.payload.text || raw.payload.caption || '',
        lang: raw.payload.lang || 'en',
        created_at: raw.payload.created_at || raw.fetched_at,
        source_ref: raw.external_id
      },
      channel: {
        platform: raw.source,
        topic: raw.payload.topic || raw.payload.hashtag || 'general'
      }
    };
    
    return canonical;
  }
}

// Export useful utilities
export { Kafka } from 'kafkajs';