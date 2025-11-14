/**
 * Genaro DFT 2.0 - Narrative Detection Service
 * 
 * Service for detecting and clustering narratives in content
 */

class NarrativeDetectionService {
  constructor() {
    // In a real implementation, this would initialize clustering and topic modeling models
    // For now, we'll simulate the narrative detection process
    this.topicModelingModel = 'bert-topic-v1';
    this.clusteringModel = 'community-detection-v1';
    this.entityExtractionModel = 'ner-v1';
  }

  /**
   * Detect narratives in a batch of content
   * @param {Array} contentBatch - Array of content items to analyze
   * @returns {Object} Narrative detection results
   */
  async detectNarratives(contentBatch) {
    // In a real implementation, this would:
    // 1. Extract features from content (text, entities, topics)
    // 2. Apply clustering algorithms to group related content
    // 3. Apply topic modeling to identify narrative themes
    // 4. Return detected narratives
    
    // Simulate processing time
    await this.delay(1000 + Math.random() * 1000);
    
    // Group content into narratives using simple heuristics
    // In a real implementation, this would use sophisticated clustering algorithms
    const narratives = await this.groupIntoNarratives(contentBatch);
    
    return {
      batch_id: `batch-${Date.now()}`,
      narratives: narratives,
      total_content: contentBatch.length,
      unique_narratives: narratives.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Group content into narratives using clustering
   */
  async groupIntoNarratives(contentBatch) {
    // Simple similarity-based grouping for simulation
    // In a real implementation, this would use:
    // - Semantic similarity (using embeddings)
    // - Entity overlap
    // - Topic modeling (LDA, BERTopic, etc.)
    // - Graph-based clustering for propagation patterns
    
    const narratives = [];
    const processedContent = new Set();
    
    for (let i = 0; i < contentBatch.length; i++) {
      const content = contentBatch[i];
      
      if (processedContent.has(content.id)) {
        continue;
      }
      
      // Find similar content to group together
      const similarContent = [content];
      processedContent.add(content.id);
      
      for (let j = i + 1; j < contentBatch.length; j++) {
        const otherContent = contentBatch[j];
        
        if (processedContent.has(otherContent.id)) {
          continue;
        }
        
        // Calculate similarity (simulated)
        const similarity = this.calculateContentSimilarity(content, otherContent);
        
        // Group if similarity is above threshold
        if (similarity > 0.6) {
          similarContent.push(otherContent);
          processedContent.add(otherContent.id);
        }
      }
      
      // Create narrative from grouped content
      if (similarContent.length > 0) {
        const narrative = await this.createNarrativeFromContent(similarContent);
        narratives.push(narrative);
      }
    }
    
    return narratives;
  }

  /**
   * Calculate similarity between two content items
   */
  calculateContentSimilarity(content1, content2) {
    // Simulate similarity calculation
    // In a real implementation, this would use:
    // - Semantic embeddings similarity
    // - Entity overlap
    // - Topic similarity
    
    // Simple heuristic for simulation
    let similarity = 0;
    
    // Check for shared entities (if available)
    if (content1.entities && content2.entities) {
      const entities1 = new Set(content1.entities);
      const entities2 = new Set(content2.entities);
      const commonEntities = [...entities1].filter(entity => entities2.has(entity));
      if (commonEntities.length > 0) {
        similarity += 0.4; // Boost for shared entities
      }
    }
    
    // Check if both contain similar keywords (if available)
    if (content1.text && content2.text) {
      const text1 = content1.text.toLowerCase();
      const text2 = content2.text.toLowerCase();
      
      // Simple bag-of-words similarity
      const words1 = new Set(text1.split(/\s+/));
      const words2 = new Set(text2.split(/\s+/));
      const commonWords = [...words1].filter(word => words2.has(word));
      
      if (commonWords.length > 3) {
        similarity += commonWords.length * 0.1; // Up to 0.5 for 5+ common words
      }
    }
    
    // Add some randomness to make it more realistic
    similarity += (Math.random() - 0.5) * 0.2;
    
    // Clamp between 0 and 1
    return Math.min(Math.max(similarity, 0), 1);
  }

  /**
   * Create a narrative object from grouped content
   */
  async createNarrativeFromContent(contentGroup) {
    // Extract key information from the content group to form a narrative
    const allTexts = contentGroup.map(item => item.text || '').filter(text => text);
    const allEntities = contentGroup.flatMap(item => item.entities || []);
    const allSources = [...new Set(contentGroup.map(item => item.source))];
    
    // Extract topic keywords (simulated)
    const topicKeywords = this.extractTopicKeywords(allTexts);
    
    // Find common entities
    const commonEntities = this.getCommonEntities(allEntities);
    
    // Determine sentiment alignment
    const sentimentAlignment = this.calculateSentimentAlignment(contentGroup);
    
    // Determine volume trend
    const volumeTrend = this.calculateVolumeTrend(contentGroup);
    
    // Simulate narrative properties
    const narrativeId = `nar-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const title = this.generateNarrativeTitle(topicKeywords, commonEntities);
    
    return {
      content_ids: contentGroup.map(item => item.id),
      detected_narratives: [{
        narrative_id: narrativeId,
        title: title,
        confidence: Math.random() * 0.3 + 0.7, // Between 0.7 and 1.0
        topic_keywords: topicKeywords.slice(0, 5), // Top 5 keywords
        entities: commonEntities.slice(0, 10), // Top 10 entities
        sentiment_alignment: sentimentAlignment,
        volume_trend: volumeTrend,
        size: contentGroup.length,
        sources: allSources,
        start_date: this.earliestDate(contentGroup),
        end_date: this.latestDate(contentGroup)
      }]
    };
  }

  /**
   * Extract topic keywords from texts
   */
  extractTopicKeywords(texts) {
    // Simulate topic keyword extraction
    // In a real implementation, this would use topic modeling algorithms
    
    // Simple keyword extraction for simulation
    const allWords = texts.join(' ').toLowerCase().split(/\s+/);
    const wordFreq = {};
    
    // Count word frequencies
    for (const word of allWords) {
      if (word.length > 3) { // Only consider words longer than 3 chars
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    }
    
    // Sort by frequency and return top keywords
    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 20); // Return top 20 keywords
  }

  /**
   * Get common entities
   */
  getCommonEntities(entities) {
    // Count entity occurrences
    const entityCount = {};
    for (const entity of entities) {
      entityCount[entity] = (entityCount[entity] || 0) + 1;
    }
    
    // Sort by count and return top entities
    return Object.entries(entityCount)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 20); // Return top 20 entities
  }

  /**
   * Calculate sentiment alignment of the narrative
   */
  calculateSentimentAlignment(contentGroup) {
    // Simulate sentiment alignment
    // In a real implementation, this would use sentiment analysis results
    
    // If content has sentiment values, calculate average
    const sentiments = contentGroup
      .map(item => item.sentiment)
      .filter(sentiment => sentiment !== undefined);
    
    if (sentiments.length > 0) {
      const avgSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
      return Math.min(Math.max(avgSentiment, -1), 1); // Clamp between -1 and 1
    }
    
    // Otherwise return neutral
    return (Math.random() - 0.5) * 0.4; // Small random value around neutral
  }

  /**
   * Calculate volume trend of the narrative
   */
  calculateVolumeTrend(contentGroup) {
    // Determine if the narrative volume is increasing, decreasing, or stable
    // In a real implementation, this would look at time-series patterns
    
    // For simulation, let's say 40% increasing, 40% decreasing, 20% stable
    const rand = Math.random();
    if (rand < 0.4) return 'increasing';
    if (rand < 0.8) return 'decreasing';
    return 'stable';
  }

  /**
   * Find earliest date in content group
   */
  earliestDate(contentGroup) {
    // Find the earliest date in the content group
    return contentGroup.reduce((earliest, content) => {
      const contentDate = new Date(content.date || content.timestamp || Date.now());
      return contentDate < earliest ? contentDate : earliest;
    }, new Date()).toISOString();
  }

  /**
   * Find latest date in content group
   */
  latestDate(contentGroup) {
    // Find the latest date in the content group
    return contentGroup.reduce((latest, content) => {
      const contentDate = new Date(content.date || content.timestamp || Date.now());
      return contentDate > latest ? contentDate : latest;
    }, new Date(0)).toISOString();
  }

  /**
   * Generate narrative title
   */
  generateNarrativeTitle(keywords, entities) {
    // Generate a title based on top keywords and entities
    if (keywords.length > 0 && entities.length > 0) {
      return `${keywords[0]} and ${entities[0]} narrative`;
    } else if (keywords.length > 0) {
      return `${keywords[0]} narrative`;
    } else if (entities.length > 0) {
      return `${entities[0]} narrative`;
    } else {
      return `Undetermined narrative ${Date.now()}`;
    }
  }

  /**
   * Simulate async delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
module.exports = new NarrativeDetectionService();