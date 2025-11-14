/**
 * Genaro DFT 2.0 - Governance Agent
 * 
 * Specialized agent family for ethical oversight and regulatory compliance
 * Includes Ethical Guardian Agent and Regulatory Watchdog Agent
 */

import { Agent } from './base-agent';
import { EventBus } from '../integration_layer/event_bus/event-bus';
import { EthicalGuardianAgent } from './ethical-guardian-agent';
import { RegulatoryWatchdogAgent } from './regulatory-watchdog-agent';

export interface GovernanceConfig {
  ethicalPolicies: string[];
  regulatoryFrameworks: string[];
  complianceCheckFrequency: number; // in milliseconds
  auditLogRetentionDays: number;
}

export class GovernanceAgent extends Agent {
  private config: GovernanceConfig;
  private eventBus: EventBus;
  private ethicalGuardian: EthicalGuardianAgent;
  private regulatoryWatchdog: RegulatoryWatchdogAgent;

  constructor(config: GovernanceConfig) {
    super('governance-agent');
    this.config = config;
    this.eventBus = new EventBus();
    this.ethicalGuardian = new EthicalGuardianAgent();
    this.regulatoryWatchdog = new RegulatoryWatchdogAgent();
  }

  async initialize(): Promise<void> {
    console.log('Initializing Governance Agent...');
    
    // Initialize sub-agents
    await this.ethicalGuardian.initialize();
    await this.regulatoryWatchdog.initialize();
    
    // Connect to event bus
    await this.eventBus.connect();
    
    // Subscribe to events that need governance oversight
    await this.eventBus.subscribe('analytics.results', this.processAnalyticsResults.bind(this));
    await this.eventBus.subscribe('genaro.action.proposed', this.reviewAction.bind(this));
    await this.eventBus.subscribe('content.generated', this.reviewContent.bind(this));
    await this.eventBus.subscribe('regulatory.update', this.processRegulatoryUpdate.bind(this));
    
    console.log('Governance Agent initialized successfully');
  }

  /**
   * Process analytics results for ethical and compliance review
   */
  async processAnalyticsResults(analyticsData: any): Promise<void> {
    try {
      console.log(`Processing analytics results for governance review: ${analyticsData.narrative_id}`);
      
      // Check for ethical concerns in analytics
      const ethicalReview = await this.ethicalGuardian.reviewAnalytics(analyticsData);
      
      // Check for compliance issues
      const complianceReview = await this.regulatoryWatchdog.reviewAnalytics(analyticsData);
      
      // Combine reviews
      const governanceReview = {
        analytics_id: analyticsData.narrative_id || analyticsData.forecast_id,
        ethical_review: ethicalReview,
        compliance_review: complianceReview,
        timestamp: new Date().toISOString()
      };
      
      // Store audit trail
      await this.logAuditEvent('analytics_review', governanceReview);
      
      // If any concerns, publish for human review
      if (ethicalReview.flags.length > 0 || complianceReview.flags.length > 0) {
        await this.eventBus.publish('governance.concerns', {
          ...governanceReview,
          severity: this.determineSeverity(ethicalReview, complianceReview)
        });
      }
      
      console.log(`Governance review completed for analytics: ${analyticsData.narrative_id}`);
    } catch (error) {
      console.error(`Error in governance review for analytics:`, error);
      throw error;
    }
  }

  /**
   * Review proposed actions for ethical and compliance issues
   */
  async reviewAction(actionData: any): Promise<void> {
    try {
      console.log(`Reviewing proposed action for compliance: ${actionData.action_id}`);
      
      // Ethical review of the action
      const ethicalReview = await this.ethicalGuardian.reviewAction(actionData);
      
      // Compliance review of the action
      const complianceReview = await this.regulatoryWatchdog.reviewAction(actionData);
      
      // Combine reviews
      const actionReview = {
        action_id: actionData.action_id,
        ethical_review: ethicalReview,
        compliance_review: complianceReview,
        approved: ethicalReview.approved && complianceReview.approved,
        timestamp: new Date().toISOString()
      };
      
      // Store audit trail
      await this.logAuditEvent('action_review', actionReview);
      
      // Publish review result
      await this.eventBus.publish('action.reviewed', actionReview);
      
      // If not approved, block the action
      if (!actionReview.approved) {
        await this.eventBus.publish('action.blocked', {
          action_id: actionData.action_id,
          reason: this.combineRejectionReasons(ethicalReview, complianceReview),
          timestamp: new Date().toISOString()
        });
      }
      
      console.log(`Action review completed: ${actionData.action_id}, approved: ${actionReview.approved}`);
    } catch (error) {
      console.error(`Error in action review:`, error);
      throw error;
    }
  }

  /**
   * Review generated content for ethical and compliance issues
   */
  async reviewContent(contentData: any): Promise<void> {
    try {
      console.log(`Reviewing generated content for compliance: ${contentData.content_id}`);
      
      // Ethical review of the content
      const ethicalReview = await this.ethicalGuardian.reviewContent(contentData);
      
      // Compliance review of the content
      const complianceReview = await this.regulatoryWatchdog.reviewContent(contentData);
      
      // Combine reviews
      const contentReview = {
        content_id: contentData.content_id,
        ethical_review: ethicalReview,
        compliance_review: complianceReview,
        approved: ethicalReview.approved && complianceReview.approved,
        timestamp: new Date().toISOString()
      };
      
      // Store audit trail
      await this.logAuditEvent('content_review', contentReview);
      
      // Publish review result
      await this.eventBus.publish('content.reviewed', contentReview);
      
      // If not approved, block the content
      if (!contentReview.approved) {
        await this.eventBus.publish('content.blocked', {
          content_id: contentData.content_id,
          reason: this.combineRejectionReasons(ethicalReview, complianceReview),
          timestamp: new Date().toISOString()
        });
      }
      
      console.log(`Content review completed: ${contentData.content_id}, approved: ${contentReview.approved}`);
    } catch (error) {
      console.error(`Error in content review:`, error);
      throw error;
    }
  }

  /**
   * Process regulatory updates and adjust policies
   */
  async processRegulatoryUpdate(updateData: any): Promise<void> {
    try {
      console.log(`Processing regulatory update: ${updateData.update_id}`);
      
      // Update regulatory policies
      await this.regulatoryWatchdog.processUpdate(updateData);
      
      // Notify other agents of policy changes
      await this.eventBus.publish('policies.updated', {
        update_id: updateData.update_id,
        changes: updateData.changes,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Regulatory update processed: ${updateData.update_id}`);
    } catch (error) {
      console.error(`Error processing regulatory update:`, error);
      throw error;
    }
  }

  /**
   * Log governance events to audit trail
   */
  private async logAuditEvent(eventType: string, eventData: any): Promise<void> {
    // In a real implementation, this would log to an immutable audit trail
    console.log(`AUDIT LOG: ${eventType}`, JSON.stringify(eventData));
  }

  /**
   * Determine the severity of governance concerns
   */
  private determineSeverity(ethicalReview: any, complianceReview: any): string {
    const ethicalSeverity = this.calculateSeverity(ethicalReview.flags);
    const complianceSeverity = this.calculateSeverity(complianceReview.flags);
    
    // Return the higher severity
    if (ethicalSeverity === 'critical' || complianceSeverity === 'critical') return 'critical';
    if (ethicalSeverity === 'high' || complianceSeverity === 'high') return 'high';
    if (ethicalSeverity === 'medium' || complianceSeverity === 'medium') return 'medium';
    return 'low';
  }

  /**
   * Calculate severity based on flags
   */
  private calculateSeverity(flags: any[]): string {
    if (flags.length === 0) return 'none';
    
    // Count critical flags
    const criticalFlags = flags.filter((flag: any) => flag.severity === 'critical');
    if (criticalFlags.length > 0) return 'critical';
    
    // Count high flags
    const highFlags = flags.filter((flag: any) => flag.severity === 'high');
    if (highFlags.length > 0) return 'high';
    
    return 'medium';
  }

  /**
   * Combine rejection reasons from ethical and compliance reviews
   */
  private combineRejectionReasons(ethicalReview: any, complianceReview: any): string {
    const reasons = [];
    
    if (!ethicalReview.approved) {
      reasons.push(`Ethical concerns: ${ethicalReview.feedback || 'General ethical issues'}`);
    }
    
    if (!complianceReview.approved) {
      reasons.push(`Compliance issues: ${complianceReview.feedback || 'General compliance issues'}`);
    }
    
    return reasons.join('; ');
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down Governance Agent...');
    
    // Disconnect from event bus
    await this.eventBus.disconnect();
    
    // Shutdown sub-agents
    await this.ethicalGuardian.shutdown();
    await this.regulatoryWatchdog.shutdown();
    
    console.log('Governance Agent shut down successfully');
  }
}