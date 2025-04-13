/**
 * Lifecycle manager for EventHub components
 * 
 * @description
 * This file contains the LifecycleManager class that manages the lifecycle
 * of EventHub components.
 */
import { EventHub } from '../event-hub';
import { ConnectionState, InitOptions, LifecycleState } from '../types/lifecycle';
import { ILifecycleHooks } from '../types/lifecycle-hooks';
import { ComponentType, getLifecycleChannel, getStateChannel, LifecycleEventType } from '../types/system-channels';

/**
 * Lifecycle manager for EventHub components
 */
export class LifecycleManager {
  /**
   * Component ID
   */
  protected readonly _componentId: string;
  
  /**
   * Component type
   */
  protected readonly _componentType: ComponentType;
  
  /**
   * EventHub instance
   */
  protected readonly _eventHub: EventHub;
  
  /**
   * Lifecycle hooks
   */
  protected readonly _lifecycleHooks: ILifecycleHooks;
  
  /**
   * Current state
   */
  protected _state: ConnectionState = {
    status: LifecycleState.DISCONNECTED,
    timestamp: Date.now(),
    componentId: '',  // Will be set in constructor
    componentType: 'eventhub' // Default, will be set in constructor
  };
  
  /**
   * State change callbacks
   */
  private _stateChangeCallbacks: ((state: ConnectionState) => void)[] = [];
  
  /**
   * Constructor
   * 
   * @param componentId Component ID
   * @param componentType Component type
   * @param eventHub EventHub instance
   * @param lifecycleHooks Lifecycle hooks
   */
  constructor(
    componentId: string,
    componentType: ComponentType,
    eventHub: EventHub,
    lifecycleHooks: ILifecycleHooks
  ) {
    this._componentId = componentId;
    this._componentType = componentType;
    this._eventHub = eventHub;
    this._lifecycleHooks = lifecycleHooks;
    
    // Update the state with the component ID and type
    this._state.componentId = componentId;
    this._state.componentType = componentType;
  }
  
  /**
   * Update the state
   * 
   * @param status New status
   * @param error Optional error
   */
  protected updateState(status: LifecycleState, error?: Error): void {
    this._state = {
      status,
      timestamp: Date.now(),
      error,
      componentId: this._componentId,
      componentType: this._componentType
    };
    
    // Notify state change callbacks
    this._stateChangeCallbacks.forEach((callback) => {
      try {
        callback(this._state);
      } catch (callbackError) {
        console.error(`Error in state change callback: ${callbackError}`);
      }
    });
    
    // Publish state change event
    const stateChannel = getStateChannel(this._componentType, this._componentId);
    this._eventHub.publish(stateChannel, this._state).catch((error) => {
      // Ignore errors
      console.error(`Error publishing state change: ${error}`);
    });
  }
  
  /**
   * Initialize the component
   * 
   * @param options Optional initialization options
   */
  public async initialize(options?: InitOptions): Promise<void> {
    // Call the onInitialize hook
    const success = await this._lifecycleHooks.onInitialize?.(options);
    
    if (success === false) {
      this.updateState(LifecycleState.ERROR, new Error('Initialization failed'));
      throw new Error(`Failed to initialize ${this._componentType} ${this._componentId}`);
    }
    
    // Update state
    this.updateState(LifecycleState.INITIALIZED);
    
    // Publish lifecycle event
    try {
      const channel = getLifecycleChannel(LifecycleEventType.INITIALIZE, this._componentType, this._componentId);
      await this._eventHub.publish(channel, { componentId: this._componentId });
    } catch (error) {
      console.error(`Error publishing lifecycle event: ${error}`);
    }
    
    // Auto-connect if specified
    if (options?.autoConnect) {
      await this.start();
    }
  }
  
  /**
   * Start the component
   */
  public async start(): Promise<void> {
    // Call the onStart hook
    const success = await this._lifecycleHooks.onStart?.();
    
    if (success === false) {
      this.updateState(LifecycleState.ERROR, new Error('Start failed'));
      throw new Error(`Failed to start ${this._componentType} ${this._componentId}`);
    }
    
    // Update state
    this.updateState(LifecycleState.CONNECTED);
    
    // Publish lifecycle event
    try {
      const channel = getLifecycleChannel(LifecycleEventType.START, this._componentType, this._componentId);
      await this._eventHub.publish(channel, { componentId: this._componentId });
    } catch (error) {
      console.error(`Error publishing lifecycle event: ${error}`);
    }
  }
  
  /**
   * Stop the component
   */
  public async stop(): Promise<void> {
    // Call the onStop hook
    const success = await this._lifecycleHooks.onStop?.();
    
    if (success === false) {
      this.updateState(LifecycleState.ERROR, new Error('Stop failed'));
      throw new Error(`Failed to stop ${this._componentType} ${this._componentId}`);
    }
    
    // Update state
    this.updateState(LifecycleState.DISCONNECTED);
    
    // Publish lifecycle event
    try {
      const channel = getLifecycleChannel(LifecycleEventType.STOP, this._componentType, this._componentId);
      await this._eventHub.publish(channel, { componentId: this._componentId });
    } catch (error) {
      console.error(`Error publishing lifecycle event: ${error}`);
    }
  }
  
  /**
   * Destroy the component
   */
  public async destroy(): Promise<void> {
    // Stop first if connected
    if (this._state.status === LifecycleState.CONNECTED) {
      await this.stop();
    }
    
    // Call the onDestroy hook
    const success = await this._lifecycleHooks.onDestroy?.();
    
    if (success === false) {
      this.updateState(LifecycleState.ERROR, new Error('Destroy failed'));
      throw new Error(`Failed to destroy ${this._componentType} ${this._componentId}`);
    }
    
    // Update state
    this.updateState(LifecycleState.DISCONNECTED);
    
    // Publish lifecycle event
    try {
      const channel = getLifecycleChannel(LifecycleEventType.DESTROY, this._componentType, this._componentId);
      await this._eventHub.publish(channel, { componentId: this._componentId });
    } catch (error) {
      console.error(`Error publishing lifecycle event: ${error}`);
    }
  }
  
  /**
   * Register a state change callback
   * 
   * @param callback Callback function
   * @returns Unsubscribe function
   */
  public onStateChange(callback: (state: ConnectionState) => void): () => void {
    this._stateChangeCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this._stateChangeCallbacks.indexOf(callback);
      if (index !== -1) {
        this._stateChangeCallbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Get the current state
   */
  public getState(): ConnectionState {
    return { ...this._state };
  }
}
