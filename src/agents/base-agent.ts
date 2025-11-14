/**
 * Genaro DFT 2.0 - Base Agent Class
 * 
 * Abstract base class for all specialized agents in the Genaro ecosystem
 */

export abstract class Agent {
  private id: string;
  private running: boolean = false;

  constructor(id: string) {
    this.id = id;
  }

  getId(): string {
    return this.id;
  }

  isRunning(): boolean {
    return this.running;
  }

  abstract initialize(): Promise<void>;
  abstract shutdown(): Promise<void>;

  /**
   * Template method for agent lifecycle management
   */
  async run(): Promise<void> {
    try {
      await this.initialize();
      this.running = true;
      console.log(`${this.id} is running`);
      
      // Keep the agent running
      await this.waitForShutdown();
    } catch (error) {
      console.error(`Error running agent ${this.id}:`, error);
      throw error;
    }
  }

  protected async waitForShutdown(): Promise<void> {
    // This implementation waits indefinitely until shutdown is called
    // In a real implementation, this might use signals or other mechanisms
    return new Promise((resolve) => {
      const checkShutdown = () => {
        if (!this.running) {
          resolve();
        } else {
          setTimeout(checkShutdown, 1000); // Check every second
        }
      };
      checkShutdown();
    });
  }

  /**
   * Report the current status of the agent
   */
  getStatus(): any {
    return {
      id: this.id,
      running: this.running,
      timestamp: new Date().toISOString(),
      uptime: this.calculateUptime()
    };
  }

  private calculateUptime(): number {
    // Calculate uptime since the agent started running
    // This would require tracking when the agent was started
    return this.running ? Date.now() : 0; // Simplified implementation
  }
}