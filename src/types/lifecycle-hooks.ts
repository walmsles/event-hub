/**
 * Lifecycle hooks interface for component lifecycle management
 */
import { InitOptions } from './lifecycle';

/**
 * Interface for lifecycle hooks with strong typing
 */
export interface ILifecycleHooks {
  /**
   * Called when a component is being initialized
   * 
   * @param options Initialization options
   * @returns Promise that resolves to true if initialization was successful, false otherwise
   */
  onInitialize(options?: InitOptions): Promise<boolean>;
  
  /**
   * Called when a component is being started
   * 
   * @returns Promise that resolves to true if start was successful, false otherwise
   */
  onStart(): Promise<boolean>;
  
  /**
   * Called when a component is being stopped
   * 
   * @returns Promise that resolves to true if stop was successful, false otherwise
   */
  onStop(): Promise<boolean>;
  
  /**
   * Called when a component is being destroyed
   * 
   * @returns Promise that resolves to true if destroy was successful, false otherwise
   */
  onDestroy(): Promise<boolean>;
}

/**
 * Default implementation of lifecycle hooks that always returns true
 */
export class DefaultLifecycleHooks implements ILifecycleHooks {
  async onInitialize(_options?: InitOptions): Promise<boolean> {
    return true;
  }
  
  async onStart(): Promise<boolean> {
    return true;
  }
  
  async onStop(): Promise<boolean> {
    return true;
  }
  
  async onDestroy(): Promise<boolean> {
    return true;
  }
}
