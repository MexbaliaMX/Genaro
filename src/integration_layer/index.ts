/**
 * Genaro DFT 2.0 Integration Layer
 * 
 * Main entry point that initializes and connects all components
 * of the integration layer as per the architecture specification.
 */

import { eventBus } from './event_bus/event-bus';
import { startNormalizationService } from './normalization/normalizer';
import { startProcessingService } from './processing/processor';
import { ConnectorFactory, ExampleConnector } from './sdk/connector-sdk';

// Main integration layer class
class IntegrationLayer {
  private isRunning: boolean = false;
  
  constructor() {
    this.setupGracefulShutdown();
  }
  
  async initialize(): Promise<void> {
    console.log('Initializing Genaro DFT 2.0 Integration Layer...');
    
    // Connect to event bus
    await eventBus.connect();
    console.log('✓ Event bus connected');
    
    // Start services
    await startNormalizationService();
    console.log('✓ Normalization service started');
    
    await startProcessingService();
    console.log('✓ Processing service started');
    
    // Initialize sample connectors
    this.initializeSampleConnectors();
    console.log('✓ Sample connectors initialized');
    
    this.isRunning = true;
    console.log('\nGenaro DFT 2.0 Integration Layer is running!');
    console.log('Listening for events on topics:', eventBus.getTopics().join(', '));
  }
  
  private initializeSampleConnectors(): void {
    // Example: Initialize a TikTok connector
    const tikTokConfig = {
      source: 'tiktok',
      clientId: 'genaro-tiktok-connector',
      brokers: ['localhost:9092'],
      groupId: 'tiktok-group',
      apiUrl: 'https://api.tiktok.com/mock-data' // This would be the real API endpoint
    };
    
    const tikTokConnector = ConnectorFactory.create(ExampleConnector, tikTokConfig);
    
    // In a real implementation, you would start polling or subscribing
    // For this example, we'll just initialize it
    tikTokConnector.initialize()
      .then(() => console.log('✓ TikTok connector initialized'))
      .catch(err => console.error('✗ TikTok connector failed to initialize:', err));
  }
  
  private setupGracefulShutdown(): void {
    process.on('SIGTERM', async () => {
      console.log('\nReceived SIGTERM, shutting down gracefully...');
      await this.shutdown();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      console.log('\nReceived SIGINT, shutting down gracefully...');
      await this.shutdown();
      process.exit(0);
    });
  }
  
  async shutdown(): Promise<void> {
    if (!this.isRunning) return;
    
    console.log('Shutting down Integration Layer services...');
    
    // Disconnect from event bus
    await eventBus.disconnect();
    
    this.isRunning = false;
    console.log('Integration Layer shut down successfully');
  }
  
  getStatus(): { running: boolean; timestamp: string; services: any } {
    return {
      running: this.isRunning,
      timestamp: new Date().toISOString(),
      services: {
        eventBus: true,
        normalization: true,
        processing: true
      }
    };
  }
}

// Initialize and start the integration layer
async function startIntegrationLayer(): Promise<IntegrationLayer> {
  const layer = new IntegrationLayer();
  
  try {
    await layer.initialize();
    return layer;
  } catch (error) {
    console.error('Failed to start Integration Layer:', error);
    process.exit(1);
  }
}

// Start the integration layer if this file is run directly
if (require.main === module) {
  startIntegrationLayer();
}

export {
  IntegrationLayer,
  startIntegrationLayer
};