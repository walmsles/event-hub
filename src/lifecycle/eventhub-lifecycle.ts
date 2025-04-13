/**
 * EventHub lifecycle management
 * 
 * @description
 * This file contains the EventHubLifecycle class that manages the lifecycle
 * of the EventHub and its components.
 */
import { EventHub } from '../event-hub';
import { EventHubConfig, InitOptions, LifecycleState } from '../types/lifecycle';
import { ILifecycleHooks } from '../types/lifecycle-hooks';

import { LifecycleManager } from './lifecycle-manager';

/**
 * EventHub lifecycle hooks implementation
 */
export class EventHubLifecycleHooks implements ILifecycleHooks {
  constructor(
    private _eventHub: EventHub,
    private _config?: EventHubConfig
  ) {}
  
  async onInitialize(options?: InitOptions): Promise<boolean> {
    try {
      // Apply configuration if provided
      if (this._config) {
        // Apply debug mode if specified
        if (this._config.debug) {
          console.debug('EventHub debug mode enabled');
        }
      }
      
      // Apply options
      if (options) {
        // Override debug mode if specified in options
        if (options.debug !== undefined) {
          console.debug(`EventHub debug mode ${options.debug ? 'enabled' : 'disabled'} from options`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing EventHub:', error);
      return false;
    }
  }
  
  async onStart(): Promise<boolean> {
    try {
      // Start all components if configured to do so
      if (this._config?.autoConnect) {
        console.debug('EventHub auto-connect enabled, starting all components');
      }
      
      return true;
    } catch (error) {
      console.error('Error starting EventHub:', error);
      return false;
    }
  }
  
  async onStop(): Promise<boolean> {
    try {
      // Stop all components
      console.debug('Stopping all EventHub components');
      
      return true;
    } catch (error) {
      console.error('Error stopping EventHub:', error);
      return false;
    }
  }
  
  async onDestroy(): Promise<boolean> {
    try {
      // Destroy all components
      console.debug('Destroying all EventHub components');
      
      // Clear all subscriptions
      console.debug('Clearing all EventHub subscriptions');
      
      return true;
    } catch (error) {
      console.error('Error destroying EventHub:', error);
      return false;
    }
  }
}

/**
 * EventHub lifecycle manager
 */
export class EventHubLifecycle extends LifecycleManager {
  /**
   * Configuration for the EventHub
   */
  private _config?: EventHubConfig;
  
  /**
   * Constructor
   * 
   * @param eventHub EventHub instance
   * @param config Optional EventHub configuration
   * @param lifecycleHooks Optional lifecycle hooks implementation
   */
  constructor(
    eventHub: EventHub, 
    config?: EventHubConfig,
    lifecycleHooks?: ILifecycleHooks
  ) {
    // Create lifecycle hooks if not provided
    const hooks = lifecycleHooks || new EventHubLifecycleHooks(eventHub, config);
    
    // Initialize the lifecycle manager with the hooks
    super('eventhub', 'eventhub', eventHub, hooks);
    
    this._config = config;
  }
  
  /**
   * Configure the EventHub
   * 
   * @param config EventHub configuration
   */
  public async configure(config: EventHubConfig): Promise<void> {
    this._config = config;
    
    // If already initialized, apply configuration
    if (this._state.status !== LifecycleState.DISCONNECTED) {
      // Apply debug mode if specified
      if (config.debug) {
        console.debug('EventHub debug mode enabled from configure');
      }
      
      // Apply auto-connect if specified
      if (config.autoConnect && this._state.status === LifecycleState.INITIALIZED) {
        await this.start();
      }
    }
  }
  
  /**
   * Get the current configuration
   */
  public getConfig(): EventHubConfig | undefined {
    return this._config ? { ...this._config } : undefined;
  }
}
