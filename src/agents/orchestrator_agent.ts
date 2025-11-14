/**
 * Genaro DFT 2.0 - Orchestrator Agent
 * 
 * Coordinates the fleet of agents according to business objectives
 * Manages HITL checkpoints and approval workflows
 */

import { Agent } from './base-agent';
import { EventBus } from '../integration_layer/event_bus/event-bus';
import { PerceptionAgent } from './perception_agent';
import { AnalyticsAgent } from './analytics_agent';
import { GovernanceAgent } from './governance_agent';
import { GenaroAgent } from './genaro_agent';

export interface OrchestratorConfig {
  approvalWorkflows: ApprovalWorkflow[];
  businessObjectives: BusinessObjective[];
  riskThresholds: RiskThresholds;
  hitlCheckpoints: HITLCheckpoint[];
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  requiredApprovals: string[]; // Roles required to approve
  autoApproveThreshold?: number; // Confidence threshold for auto-approval
  escalationPath: string[];
}

export interface BusinessObjective {
  id: string;
  name: string;
  priority: number;
  successMetrics: string[];
  riskTolerance: number;
}

export interface RiskThresholds {
  low: number;    // Below this is low risk
  medium: number; // Between low and medium is medium risk
  high: number;   // Above medium is high risk
}

export interface HITLCheckpoint {
  id: string;
  name: string;
  triggerCondition: string; // Expression that determines when to trigger
  requiredRole: string;     // Role required to approve
  timeoutMinutes: number;   // Time before escalation
}

export interface Task {
  id: string;
  type: string; // 'perception', 'analytics', 'content', 'action', 'governance'
  payload: any;
  priority: number;
  businessObjectiveId: string;
  assignedAgent?: string;
  status: 'pending' | 'in_progress' | 'review' | 'approved' | 'blocked' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  dependencies?: string[]; // Task IDs this task depends on
}

export class OrchestratorAgent extends Agent {
  private config: OrchestratorConfig;
  private eventBus: EventBus;
  private taskQueue: Task[];
  private activeTasks: Map<string, Task>;

  constructor(config: OrchestratorConfig) {
    super('orchestrator-agent');
    this.config = config;
    this.eventBus = new EventBus();
    this.taskQueue = [];
    this.activeTasks = new Map();
  }

  async initialize(): Promise<void> {
    console.log('Initializing Orchestrator Agent...');

    // Connect to event bus to receive tasks and coordinate agents
    await this.eventBus.connect();

    // Subscribe to various event types
    await this.eventBus.subscribe('task.requested', this.handleTaskRequest.bind(this));
    await this.eventBus.subscribe('agent.status', this.handleAgentStatus.bind(this));
    await this.eventBus.subscribe('approval.requested', this.handleApprovalRequest.bind(this));
    await this.eventBus.subscribe('governance.concerns', this.handleGovernanceConcerns.bind(this));
    await this.eventBus.subscribe('analytics.results', this.handleAnalyticsResults.bind(this));
    await this.eventBus.subscribe('genaro.response', this.handleGenaroResponse.bind(this));

    console.log('Orchestrator Agent initialized successfully');
  }

  /**
   * Handle incoming task requests
   */
  async handleTaskRequest(taskData: any): Promise<void> {
    try {
      console.log(`Handling task request: ${taskData.task_id}`);
      
      // Create and prioritize the task
      const task = this.createTask(taskData);
      
      // Add to queue
      this.taskQueue.push(task);
      
      // Process the queue (potentially in priority order)
      await this.processTaskQueue();
      
      console.log(`Task request handled: ${taskData.task_id}`);
    } catch (error) {
      console.error(`Error handling task request:`, error);
      throw error;
    }
  }

  /**
   * Handle agent status updates
   */
  async handleAgentStatus(agentStatus: any): Promise<void> {
    try {
      console.log(`Agent status update: ${agentStatus.agent_id} - ${agentStatus.status}`);
      
      // Update the status of any tasks associated with this agent
      for (const [taskId, task] of this.activeTasks) {
        if (task.assignedAgent === agentStatus.agent_id) {
          if (agentStatus.status === 'error' || agentStatus.status === 'offline') {
            // Reassign task or mark as failed
            this.updateTaskStatus(taskId, 'failed');
          }
        }
      }
    } catch (error) {
      console.error(`Error handling agent status:`, error);
    }
  }

  /**
   * Handle approval requests
   */
  async handleApprovalRequest(approvalData: any): Promise<void> {
    try {
      console.log(`Handling approval request: ${approvalData.request_id}`);
      
      // Process the approval based on configured workflows
      const result = await this.processApproval(approvalData);
      
      // Publish the result
      await this.eventBus.publish('approval.completed', {
        request_id: approvalData.request_id,
        approved: result.approved,
        reason: result.reason,
        timestamp: new Date().toISOString()
      });
      
      // If approved, continue with the task
      if (result.approved) {
        await this.continueTask(approvalData.task_id);
      }
    } catch (error) {
      console.error(`Error handling approval request:`, error);
    }
  }

  /**
   * Handle governance concerns
   */
  async handleGovernanceConcerns(concernsData: any): Promise<void> {
    try {
      console.log(`Handling governance concerns: ${concernsData.analytics_id}`);

      // Block or adjust tasks based on governance concerns
      await this.applyGovernanceControls(concernsData);
    } catch (error) {
      console.error(`Error handling governance concerns:`, error);
    }
  }

  /**
   * Handle analytics results and coordinate next steps
   */
  async handleAnalyticsResults(resultsData: any): Promise<void> {
    try {
      console.log(`Handling analytics results: ${resultsData.narrative_id}`);

      // Based on analytics results, determine if further action is needed
      if (resultsData.risk_assessment && resultsData.risk_assessment.overall_risk_score > 0.7) {
        // High risk detected, trigger Genaro analysis
        await this.eventBus.publish('genaro.request', {
          id: `genaro-${Date.now()}`,
          userId: 'system',
          requestType: 'analysis',
          query: `Analyze the high-risk narrative ${resultsData.narrative_id} and suggest mitigation strategies`,
          context: {
            narrative_id: resultsData.narrative_id,
            risk_data: resultsData.risk_assessment
          },
          priority: 10,
          timestamp: new Date().toISOString()
        });
      }

      // If opportunities identified, trigger strategy development
      if (resultsData.opportunities && resultsData.opportunities.length > 0) {
        await this.eventBus.publish('genaro.request', {
          id: `genaro-${Date.now()}-strategy`,
          userId: 'system',
          requestType: 'strategy',
          query: `Develop strategy for the identified opportunity in narrative ${resultsData.narrative_id}`,
          context: {
            narrative_id: resultsData.narrative_id,
            opportunities: resultsData.opportunities
          },
          priority: 8,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(`Error handling analytics results:`, error);
    }
  }

  /**
   * Handle Genaro responses and coordinate action
   */
  async handleGenaroResponse(responseData: any): Promise<void> {
    try {
      console.log(`Handling Genaro response: ${responseData.id}`);

      // Based on the response type, coordinate next steps
      if (responseData.response_type === 'strategy' && responseData.content.tactical_steps) {
        // Strategy proposed, submit for approval
        await this.eventBus.publish('action.proposed', {
          id: `action-${Date.now()}`,
          strategy_id: responseData.request_id,
          steps: responseData.content.tactical_steps,
          risk_assessment: responseData.content.risk_assessment,
          ethical_considerations: responseData.content.ethical_considerations,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(`Error handling Genaro response:`, error);
    }
  }

  /**
   * Create a task from request data
   */
  private createTask(taskData: any): Task {
    return {
      id: taskData.task_id,
      type: taskData.task_type,
      payload: taskData.payload,
      priority: taskData.priority || 5, // Default priority
      businessObjectiveId: taskData.business_objective_id || 'default',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Process the task queue
   */
  private async processTaskQueue(): Promise<void> {
    // Sort tasks by priority
    this.taskQueue.sort((a, b) => b.priority - a.priority);
    
    // Process each task
    for (const task of this.taskQueue) {
      if (task.status === 'pending') {
        await this.assignTask(task);
      }
    }
  }

  /**
   * Assign a task to an appropriate agent
   */
  private async assignTask(task: Task): Promise<void> {
    // Mark task as in progress
    this.updateTaskStatus(task.id, 'in_progress');
    
    // Determine which agent should handle this task based on type
    let targetAgent: string;
    switch (task.type) {
      case 'perception':
        targetAgent = 'perception-agent';
        break;
      case 'analytics':
        targetAgent = 'analytics-agent';
        break;
      case 'governance':
        targetAgent = 'governance-agent';
        break;
      case 'genaro':
        targetAgent = 'genaro-agent';
        break;
      default:
        targetAgent = 'analytics-agent'; // Default to analytics
    }
    
    // Store task and mark as active
    task.assignedAgent = targetAgent;
    this.activeTasks.set(task.id, task);
    
    // Publish task to the appropriate agent topic
    await this.eventBus.publish(`task.${task.type}`, {
      ...task,
      agent_id: targetAgent,
      assigned_at: new Date().toISOString()
    });
  }

  /**
   * Update task status and record timestamp
   */
  private updateTaskStatus(taskId: string, status: Task['status']): void {
    const task = this.activeTasks.get(taskId);
    if (task) {
      task.status = status;
      task.updatedAt = new Date().toISOString();
      
      // If it was in queue, update queue status
      const queueIndex = this.taskQueue.findIndex(t => t.id === taskId);
      if (queueIndex !== -1) {
        this.taskQueue[queueIndex].status = status;
      }
    }
  }

  /**
   * Continue processing a task after approval
   */
  private async continueTask(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      console.error(`Task not found: ${taskId}`);
      return;
    }
    
    // If the task was waiting for approval, continue with assignment
    if (task.status === 'review') {
      // Reset status to pending to be reprocessed
      this.updateTaskStatus(taskId, 'pending');
      await this.processTaskQueue();
    }
  }

  /**
   * Apply governance controls based on concerns
   */
  private async applyGovernanceControls(concernsData: any): Promise<void> {
    // Apply controls based on severity
    switch (concernsData.severity) {
      case 'critical':
        // Immediately block related tasks
        await this.blockRelatedTasks(concernsData.analytics_id, 'governance_block');
        break;
      case 'high':
        // Trigger additional review
        await this.flagForReview(concernsData.analytics_id);
        break;
      case 'medium':
        // Log for monitoring
        await this.logForMonitoring(concernsData.analytics_id);
        break;
    }
    
    // Publish governance alert
    await this.eventBus.publish('governance.alert', {
      concerns: concernsData,
      action_taken: `Applied controls for severity: ${concernsData.severity}`,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Block tasks related to a specific ID
   */
  private async blockRelatedTasks(entityId: string, reason: string): Promise<void> {
    // Find tasks related to this entity and block them
    for (const [taskId, task] of this.activeTasks) {
      if (task.payload?.entity_id === entityId) {
        this.updateTaskStatus(taskId, 'blocked');
        await this.eventBus.publish('task.blocked', {
          task_id: taskId,
          reason,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Flag an entity for human review
   */
  private async flagForReview(entityId: string): Promise<void> {
    await this.eventBus.publish('review.flagged', {
      entity_id: entityId,
      reason: 'Governance concerns require human review',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log entity for monitoring
   */
  private async logForMonitoring(entityId: string): Promise<void> {
    await this.eventBus.publish('monitoring.log', {
      entity_id: entityId,
      reason: 'Medium severity governance concerns',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Process an approval request through configured workflows
   */
  private async processApproval(approvalData: any): Promise<{ approved: boolean; reason: string }> {
    // Find the appropriate approval workflow
    const workflow = this.config.approvalWorkflows.find(wf => 
      wf.id === approvalData.workflow_id
    );
    
    if (!workflow) {
      return { approved: false, reason: 'No matching approval workflow found' };
    }
    
    // Check if confidence is high enough for auto-approval
    if (workflow.autoApproveThreshold !== undefined && 
        approvalData.confidence >= workflow.autoApproveThreshold) {
      return { approved: true, reason: 'Auto-approved based on high confidence' };
    }
    
    // Otherwise, require human approval (this would integrate with actual approval systems)
    // For now, we'll assume approval is given if required roles are met
    const requiredRolesMet = approvalData.approver_roles && 
      workflow.requiredApprovals.every(role => approvalData.approver_roles.includes(role));
    
    return { 
      approved: requiredRolesMet, 
      reason: requiredRolesMet ? 'Approved by required roles' : 'Not approved by required roles' 
    };
  }

  /**
   * Route tasks based on business objectives and agent availability
   */
  private routeTask(task: Task): void {
    // Determine the best agent based on business objectives, task type, and current load
    const businessObjective = this.config.businessObjectives.find(
      obj => obj.id === task.businessObjectiveId
    ) || this.config.businessObjectives[0]; // Default to first objective
    
    // Assign based on priority and objective
    // This is a simplified routing - in real implementation would consider agent load, skills, etc.
    
    // Publish to the appropriate agent
    this.assignTask(task);
  }

  /**
   * Check if a HITL checkpoint should be triggered
   */
  private shouldTriggerHITL(task: Task, context: any): boolean {
    // Evaluate trigger conditions in the context
    for (const checkpoint of this.config.hitlCheckpoints) {
      // This would evaluate a condition expression against the context
      // Simplified implementation for now
      if (checkpoint.triggerCondition === 'high_risk' && context.risk_level === 'high') {
        return true;
      }
    }
    return false;
  }

  /**
   * Trigger a HITL checkpoint
   */
  private async triggerHITL(task: Task, checkpointId: string): Promise<void> {
    const checkpoint = this.config.hitlCheckpoints.find(cp => cp.id === checkpointId);
    if (!checkpoint) {
      console.error(`Checkpoint not found: ${checkpointId}`);
      return;
    }
    
    // Update task status to review
    this.updateTaskStatus(task.id, 'review');
    
    // Publish approval request
    await this.eventBus.publish('approval.requested', {
      task_id: task.id,
      checkpoint_id: checkpointId,
      required_role: checkpoint.requiredRole,
      timeout_minutes: checkpoint.timeoutMinutes,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get the status of all active tasks
   */
  getActiveTaskStatus(): any[] {
    return Array.from(this.activeTasks.values()).map(task => ({
      id: task.id,
      type: task.type,
      status: task.status,
      assignedAgent: task.assignedAgent,
      updatedAt: task.updatedAt
    }));
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down Orchestrator Agent...');
    
    // Disconnect from event bus
    await this.eventBus.disconnect();
    
    // Clear task queues
    this.taskQueue = [];
    this.activeTasks.clear();
    
    console.log('Orchestrator Agent shut down successfully');
  }
}