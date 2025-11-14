/**
 * Genaro DFT 2.0 - Canonical Model Service
 * 
 * Service for handling the DFT Canonical Model transformations
 */

class CanonicalModelService {
  constructor() {
    // In a real implementation, this would connect to validation schemas
  }

  /**
   * Transform raw data from various sources to the canonical model
   */
  transformToCanonical(rawData, sourceType) {
    // Transform different source types to the canonical model
    switch (sourceType) {
      case 'social_media':
        return this.transformSocialMedia(rawData);
      case 'news_feed':
        return this.transformNewsFeed(rawData);
      case 'ad_platform':
        return this.transformAdPlatform(rawData);
      case 'enterprise':
        return this.transformEnterprise(rawData);
      default:
        return this.transformGeneric(rawData);
    }
  }

  /**
   * Transform social media data to canonical model
   */
  transformSocialMedia(rawData) {
    const canonical = {
      artifact: {
        id: rawData.id || rawData.external_id,
        type: this.inferMediaType(rawData),
        text: rawData.text || rawData.caption || rawData.content,
        media: this.extractMedia(rawData),
        lang: rawData.language || rawData.lang || 'unknown',
        created_at: rawData.created_at || rawData.timestamp || new Date().toISOString(),
        actor_id: rawData.actor_id || rawData.user_id || rawData.author_id,
        source_ref: rawData.source_ref || rawData.url || rawData.permalink
      },
      channel: {
        platform: rawData.platform,
        topic: rawData.hashtags ? rawData.hashtags.join(',') : rawData.topic || 'general',
        community_id: rawData.community_id || rawData.group_id
      },
      metadata: {
        source_type: 'social_media',
        original_data: rawData,
        engagement: {
          likes: rawData.likes || rawData.favorites || 0,
          shares: rawData.shares || rawData.retweets || 0,
          comments: rawData.comments || rawData.replies || 0,
          impressions: rawData.impressions || 0
        }
      }
    };

    return canonical;
  }

  /**
   * Transform news feed data to canonical model
   */
  transformNewsFeed(rawData) {
    const canonical = {
      artifact: {
        id: rawData.id || rawData.article_id,
        type: 'text', // News is typically text-based
        text: rawData.headline + ' ' + (rawData.summary || rawData.description || rawData.content),
        media: this.extractMedia(rawData),
        lang: rawData.language || rawData.lang || 'unknown',
        created_at: rawData.published_at || rawData.timestamp || new Date().toISOString(),
        actor_id: rawData.publisher_id || rawData.source_id,
        source_ref: rawData.url || rawData.permalink
      },
      channel: {
        platform: rawData.source || rawData.publisher || 'news_feed',
        topic: rawData.category || rawData.section || 'general',
        community_id: rawData.feed_id || rawData.channel_id
      },
      metadata: {
        source_type: 'news_feed',
        original_data: rawData,
        engagement: {
          views: rawData.views || 0,
          shares: rawData.shares || 0,
          saves: rawData.saves || 0,
          comments: rawData.comments || 0
        }
      }
    };

    return canonical;
  }

  /**
   * Transform advertising platform data to canonical model
   */
  transformAdPlatform(rawData) {
    const canonical = {
      artifact: {
        id: rawData.ad_id || rawData.creative_id,
        type: this.inferCreativeType(rawData),
        text: rawData.headline + ' ' + (rawData.description || rawData.text || ''),
        media: this.extractCreativeMedia(rawData),
        lang: rawData.language || 'unknown',
        created_at: rawData.created_at || rawData.start_date || new Date().toISOString(),
        actor_id: rawData.account_id || rawData.advertiser_id,
        source_ref: rawData.creative_url || rawData.destination_url
      },
      channel: {
        platform: rawData.platform || 'ad_platform',
        topic: rawData.campaign_name || rawData.ad_set_name || 'unknown',
        community_id: rawData.campaign_id || rawData.ad_set_id
      },
      metadata: {
        source_type: 'ad_platform',
        original_data: rawData,
        engagement: {
          impressions: rawData.impressions || 0,
          clicks: rawData.clicks || 0,
          conversions: rawData.conversions || 0,
          spend: rawData.spend || 0,
          currency: rawData.currency || 'USD'
        }
      }
    };

    return canonical;
  }

  /**
   * Transform enterprise data to canonical model
   */
  transformEnterprise(rawData) {
    const canonical = {
      artifact: {
        id: rawData.id || rawData.record_id,
        type: this.inferDocumentType(rawData),
        text: rawData.title + ' ' + (rawData.content || rawData.description || rawData.body || ''),
        media: this.extractDocumentMedia(rawData),
        lang: rawData.language || 'unknown',
        created_at: rawData.created_at || rawData.timestamp || rawData.date || new Date().toISOString(),
        actor_id: rawData.owner_id || rawData.user_id || rawData.author_id,
        source_ref: rawData.url || rawData.path || rawData.identifier
      },
      channel: {
        platform: rawData.system || rawData.source_system || 'enterprise',
        topic: rawData.category || rawData.department || rawData.project || 'general',
        community_id: rawData.workspace_id || rawData.group_id || rawData.department_id
      },
      metadata: {
        source_type: 'enterprise',
        original_data: rawData,
        engagement: {
          views: rawData.views || 0,
          edits: rawData.edits || 0,
          comments: rawData.comments || 0,
          shares: rawData.shares || 0
        }
      }
    };

    return canonical;
  }

  /**
   * Generic transformation for unknown source types
   */
  transformGeneric(rawData) {
    // Determine the most appropriate transformation based on available fields
    if (rawData.text || rawData.content) {
      // Likely text-based content
      return {
        artifact: {
          id: rawData.id || rawData.external_id,
          type: 'text',
          text: rawData.text || rawData.content,
          media: [],
          lang: rawData.language || 'unknown',
          created_at: rawData.timestamp || rawData.created_at || new Date().toISOString(),
          actor_id: rawData.actor_id || rawData.user_id,
          source_ref: rawData.source_ref || rawData.url
        },
        channel: {
          platform: rawData.platform || 'unknown',
          topic: rawData.topic || 'general',
          community_id: rawData.community_id
        },
        metadata: {
          source_type: 'generic',
          original_data: rawData
        }
      };
    }

    // Default transformation
    return {
      artifact: {
        id: rawData.id || Date.now().toString(),
        type: 'unknown',
        text: '',
        media: [],
        lang: 'unknown',
        created_at: new Date().toISOString(),
        actor_id: rawData.actor_id || 'unknown',
        source_ref: rawData.source_ref || 'unknown'
      },
      channel: {
        platform: rawData.platform || 'unknown',
        topic: 'general',
        community_id: rawData.community_id
      },
      metadata: {
        source_type: 'generic',
        original_data: rawData
      }
    };
  }

  /**
   * Infer media type from raw data
   */
  inferMediaType(rawData) {
    if (rawData.media_type) {
      return rawData.media_type;
    }
    
    if (rawData.video_url || rawData.videos || (rawData.media && rawData.media.some(m => m.type === 'video'))) {
      return 'video';
    }
    
    if (rawData.image_url || rawData.images || (rawData.media && rawData.media.some(m => m.type === 'image'))) {
      return 'image';
    }
    
    if (rawData.audio_url || rawData.audios || (rawData.media && rawData.media.some(m => m.type === 'audio'))) {
      return 'audio';
    }
    
    return 'text';
  }

  /**
   * Infer creative type from ad data
   */
  inferCreativeType(rawData) {
    if (rawData.creative_type) {
      return rawData.creative_type;
    }
    
    if (rawData.video_url || rawData.video_id) {
      return 'video';
    }
    
    if (rawData.image_url || rawData.image_id || rawData.thumbnail_url) {
      return 'image';
    }
    
    return 'text';
  }

  /**
   * Infer document type from enterprise data
   */
  inferDocumentType(rawData) {
    if (rawData.document_type) {
      return rawData.document_type;
    }
    
    if (rawData.file_type) {
      return rawData.file_type;
    }
    
    if (rawData.filename) {
      const ext = rawData.filename.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
      if (['mp4', 'avi', 'mov'].includes(ext)) return 'video';
      if (['mp3', 'wav'].includes(ext)) return 'audio';
    }
    
    return 'text';
  }

  /**
   * Extract media information from raw data
   */
  extractMedia(rawData) {
    const media = [];
    
    // Handle various media formats
    if (rawData.media) {
      if (Array.isArray(rawData.media)) {
        rawData.media.forEach(m => {
          media.push({
            url: m.url || m.media_url,
            kind: m.type || m.kind || 'unknown'
          });
        });
      } else {
        // Single media object
        media.push({
          url: rawData.media.url || rawData.media.media_url,
          kind: rawData.media.type || rawData.media.kind || 'unknown'
        });
      }
    }
    
    // Handle specific fields
    if (rawData.image_url) {
      media.push({ url: rawData.image_url, kind: 'image' });
    }
    
    if (rawData.video_url) {
      media.push({ url: rawData.video_url, kind: 'video' });
    }
    
    return media;
  }

  /**
   * Extract creative media from ad data
   */
  extractCreativeMedia(rawData) {
    const media = [];
    
    if (rawData.creative_assets) {
      rawData.creative_assets.forEach(asset => {
        media.push({
          url: asset.url,
          kind: asset.type || 'image'
        });
      });
    }
    
    if (rawData.thumbnail_url) {
      media.push({ url: rawData.thumbnail_url, kind: 'image' });
    }
    
    if (rawData.video_url) {
      media.push({ url: rawData.video_url, kind: 'video' });
    }
    
    return media;
  }

  /**
   * Extract document media from enterprise data
   */
  extractDocumentMedia(rawData) {
    const media = [];
    
    if (rawData.attachments) {
      rawData.attachments.forEach(att => {
        media.push({
          url: att.url || att.path,
          kind: att.type || 'document'
        });
      });
    }
    
    if (rawData.thumbnail_url) {
      media.push({ url: rawData.thumbnail_url, kind: 'image' });
    }
    
    return media;
  }

  /**
   * Validate canonical model against the schema
   */
  validateCanonicalModel(canonicalData) {
    // Check required fields for artifact
    if (!canonicalData.artifact.id) {
      throw new Error('Missing required field: artifact.id');
    }
    
    if (!canonicalData.artifact.type) {
      throw new Error('Missing required field: artifact.type');
    }
    
    // Check required fields for channel
    if (!canonicalData.channel.platform) {
      throw new Error('Missing required field: channel.platform');
    }
    
    // Additional validation could be added here
    return true;
  }

  /**
   * Normalize text content
   */
  normalizeText(text) {
    if (!text) return '';
    
    // Remove extra whitespace and normalize line breaks
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();
  }
}

// Export singleton instance
module.exports = new CanonicalModelService();