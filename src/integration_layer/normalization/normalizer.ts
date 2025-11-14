/**
 * Genaro DFT 2.0 Normalization & Enrichment Layer
 * 
 * Handles the transformation of raw data to the DFT Canonical Model
 * and enrichment with additional metadata, PII detection, and more.
 */

import { 
  eventBus, 
  RawContentIngested, 
  CanonicalContentNormalized, 
  SignalSentimentScored,
  NarrativeRiskDetected 
} from '../event_bus/event-bus';

// PII Detection service
class PIIDetector {
  private patterns: Map<string, RegExp>;
  
  constructor() {
    this.patterns = new Map();
    this.patterns.set('email', /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
    this.patterns.set('phone', /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g);
    this.patterns.set('ssn', /\b\d{3}-\d{2}-\d{4}\b/g);
    this.patterns.set('credit_card', /\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g);
  }
  
  detectPII(text: string): { type: string, value: string }[] {
    const results: { type: string, value: string }[] = [];
    
    for (const [type, pattern] of this.patterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          results.push({ type, value: match });
        });
      }
    }
    
    return results;
  }
  
  maskPII(text: string): string {
    let maskedText = text;
    
    for (const [type, pattern] of this.patterns) {
      maskedText = maskedText.replace(pattern, `[${type.toUpperCase()}_MASKED]`);
    }
    
    return maskedText;
  }
}

// Language identification service
class LanguageIdentifier {
  private languageCodes: Set<string> = new Set([
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'
  ]);
  
  identify(text: string): string {
    // Simplified language detection
    // In a real implementation, this would use a proper language detection library like franc
    if (text.includes('el ') && text.includes('la ')) return 'es';
    if (text.includes('le ') && text.includes('la ')) return 'fr';
    if (text.includes('der ') && text.includes('die ')) return 'de';
    if (text.includes('the ') && text.includes('and ')) return 'en';
    
    // Default to English if no pattern found
    return 'en';
  }
}

// Media enricher service (handles STT, OCR)
class MediaEnricher {
  async processMedia(mediaUrl: string): Promise<{ text?: string, metadata?: any }> {
    // In a real implementation, this would call external services for STT, OCR, etc.
    // For now, returning a mock response
    console.log(`Processing media: ${mediaUrl}`);
    
    // Mock response - in real implementation, this would return actual processed content
    return {
      text: `Processed content from ${mediaUrl}`, 
      metadata: { 
        duration: 120, 
        size: '1080p', 
        format: 'mp4',
        language: 'en'
      }
    };
  }
}

// The normalizer service that implements the core logic
class NormalizerService {
  private piiDetector: PIIDetector;
  private langIdentifier: LanguageIdentifier;
  private mediaEnricher: MediaEnricher;
  
  constructor() {
    this.piiDetector = new PIIDetector();
    this.langIdentifier = new LanguageIdentifier();
    this.mediaEnricher = new MediaEnricher();
  }
  
  async processRawContent(rawPayload: RawContentIngested): Promise<void> {
    try {
      console.log(`Normalizing content from source: ${rawPayload.source}`);
      
      // Step 1: Normalize to canonical model
      const canonicalPayload = await this.normalize(rawPayload);
      
      // Step 2: Enrich with additional metadata
      const enrichedPayload = await this.enrich(canonicalPayload);
      
      // Step 3: Check for PII and mask if necessary
      const processedPayload = await this.processPII(enrichedPayload);
      
      // Step 4: Publish to canonical topic
      await eventBus.publish('canon.content.normalized', processedPayload);
      
      // Step 5: Trigger enrichment processes (sentiment, etc.)
      await this.triggerEnrichment(processedPayload);
      
      console.log(`Successfully processed and normalized content: ${processedPayload.artifact.id}`);
    } catch (error) {
      console.error(`Error normalizing content:`, error);
      
      // In a real implementation, this would send to a dead letter queue
      // For now, we'll just log the error
    }
  }
  
  private async normalize(raw: RawContentIngested): Promise<CanonicalContentNormalized> {
    // Determine content type
    let contentType: 'text' | 'image' | 'video' | 'audio' = 'text';
    let text = '';
    let media: { url: string; kind: string }[] | undefined;
    
    // Extract content from raw payload based on source
    if (raw.source === 'tiktok' || raw.source === 'instagram') {
      // Handle social media content
      if (raw.payload.caption) {
        text = raw.payload.caption;
      }
      if (raw.payload.media_urls && Array.isArray(raw.payload.media_urls)) {
        media = raw.payload.media_urls.map((url: string) => ({ 
          url, 
          kind: url.includes('video') ? 'video' : 'image' 
        }));
      }
    } else if (raw.source === 'x') {
      // Handle X (Twitter) content
      text = raw.payload.text || raw.payload.full_text || '';
      if (raw.payload.extended_entities?.media) {
        media = raw.payload.extended_entities.media.map((m: any) => ({
          url: m.media_url_https || m.video_url,
          kind: m.type.includes('video') ? 'video' : 'image'
        }));
      }
    } else {
      // Default handling
      text = JSON.stringify(raw.payload);
    }
    
    // Detect media-derived content types if nothing explicit was provided
    if (media && media.length) {
      if (media.some(item => item.kind === 'video')) {
        contentType = 'video';
      } else if (media.some(item => item.kind === 'image')) {
        contentType = 'image';
      }
    }
    
    const inferredMediaType = (raw.payload.media_type || raw.payload.type || '').toString().toLowerCase();
    if (inferredMediaType.includes('video')) {
      contentType = 'video';
    } else if (inferredMediaType.includes('image')) {
      contentType = 'image';
    } else if (inferredMediaType.includes('audio') || inferredMediaType.includes('podcast')) {
      contentType = 'audio';
    } else if (!text && media?.length === 0 && raw.payload.audio_url) {
      contentType = 'audio';
    }
    
    // Identify language
    const lang = this.langIdentifier.identify(text) || raw.payload.lang || 'en';
    
    return {
      artifact: {
        id: `art_${raw.external_id}`,
        type: contentType,
        text: text ? text : undefined,
        media,
        lang,
        created_at: raw.payload.created_at || raw.fetched_at,
        actor_id: raw.payload.user_id || raw.payload.actor_id
      },
      channel: {
        platform: raw.source,
        topic: raw.payload.hashtags?.join(',') || raw.payload.topic || 'general'
      },
      metadata: {
        source_original: raw.payload,
        normalized_at: new Date().toISOString()
      }
    };
  }
  
  private async enrich(payload: CanonicalContentNormalized): Promise<CanonicalContentNormalized> {
    // Enrich with additional metadata
    if (payload.artifact.media && payload.artifact.media.length > 0) {
      for (const mediaItem of payload.artifact.media) {
        try {
          // Process media (STT, OCR, etc.)
          const mediaResult = await this.mediaEnricher.processMedia(mediaItem.url);
          
          if (mediaResult.text) {
            // Append media transcript to main text
            if (payload.artifact.text) {
              payload.artifact.text += `\n[Media Transcript: ${mediaResult.text}]`;
            } else {
              payload.artifact.text = `[Media Transcript: ${mediaResult.text}]`;
            }
          }
          
          // Add metadata
          if (mediaResult.metadata) {
            if (!payload.metadata) payload.metadata = {};
            payload.metadata[mediaItem.url] = mediaResult.metadata;
          }
        } catch (error) {
          console.warn(`Could not process media ${mediaItem.url}:`, error);
        }
      }
    }
    
    return payload;
  }
  
  private async processPII(payload: CanonicalContentNormalized): Promise<CanonicalContentNormalized> {
    // Check for PII in text
    if (payload.artifact.text) {
      const piiFound = this.piiDetector.detectPII(payload.artifact.text);
      
      if (piiFound.length > 0) {
        // Mask PII in text
        payload.artifact.text = this.piiDetector.maskPII(payload.artifact.text);
        
        // Mark as PII detected
        if (!payload.metadata) payload.metadata = {};
        payload.metadata.pii_detected = true;
        payload.metadata.pii_masked = piiFound;
      }
    }
    
    return payload;
  }
  
  private async triggerEnrichment(payload: CanonicalContentNormalized): Promise<void> {
    // Trigger sentiment analysis
    const sentimentScore: SignalSentimentScored = {
      artifact_id: payload.artifact.id,
      signals: {
        sentiment: {
          value: Math.random() * 2 - 1, // Random value between -1 and 1
          confidence: 0.85,
          model: 'dft-sentiment-v1'
        },
        toxicity: {
          value: Math.random() * 0.5 // Random value between 0 and 0.5
        }
      }
    };
    
    // Publish sentiment score
    await eventBus.publish('signal.sentiment.scored', sentimentScore);
    
    // In a real implementation, this would also trigger other ML services
    // like NER, topic modeling, etc.
  }
}

// Initialize the normalizer service and start processing
const normalizerService = new NormalizerService();

// Subscribe to the raw content topic to process incoming data
async function startNormalizationService() {
  console.log('Starting normalization service...');
  
  // Create a consumer for raw content
  const consumer = await eventBus.createConsumer(
    'normalizer-group',
    ['raw.content.ingested']
  );
  
  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (message.value) {
        try {
          const rawPayload: RawContentIngested = JSON.parse(message.value.toString());
          await normalizerService.processRawContent(rawPayload);
        } catch (error) {
          console.error('Error processing raw content:', error);
        }
      }
    }
  }).catch(error => {
    console.error('Normalizer consumer crashed:', error);
  });
}

export {
  NormalizerService,
  PIIDetector,
  LanguageIdentifier,
  MediaEnricher,
  startNormalizationService
};
