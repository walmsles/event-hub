/**
 * Interface for lifecycle hooks
 */
import { InitOptions } from './lifecycle';

/**
 * Interface for lifecycle hooks
 */
export interface ILifecycleHooks {
  /**
   * Called before initialization
   */
  beforeInitialize?(): Promise<void>;
  
  /**
   * Called after initialization
   */
  afterInitialize?(): Promise<void>;
  
  /**
   * Called before connecting
   */
  beforeConnect?(): Promise<void>;
  
  /**
   * Called after connecting
   */
  afterConnect?(): Promise<void>;
  
  /**
   * Called before disconnecting
   */
  beforeDisconnect?(): Promise<void>;
  
  /**
   * Called after disconnecting
   */
  afterDisconnect?(): Promise<void>;
  
  /**
   * Called before destroying
   */
  beforeDestroy?(): Promise<void>;
  
  /**
   * Called after destroying
   */
  afterDestroy?(): Promise<void>;
  
  /**
   * Called during initialization
   * @param options Initialization options
   * @returns Whether initialization was successful
   */
  onInitialize?(options?: InitOptions): Promise<boolean>;
  
  /**
   * Called during start
   * @returns Whether start was successful
   */
  onStart?(): Promise<boolean>;
  
  /**
   * Called during stop
   * @returns Whether stop was successful
   */
  onStop?(): Promise<boolean>;
  
  /**
   * Called during destroy
   * @returns Whether destroy was successful
   */
  onDestroy?(): Promise<boolean>;
}

/**
 * Default implementation of lifecycle hooks
 */
export class DefaultLifecycleHooks implements ILifecycleHooks {
  /**
   * Called before initialization
   */
  async beforeInitialize(): Promise<void> {}
  
  /**
   * Called after initialization
   */
  async afterInitialize(): Promise<void> {}
  
  /**
   * Called before connecting
   */
  async beforeConnect(): Promise<void> {}
  
  /**
   * Called after connecting
   */
  async afterConnect(): Promise<void> {}
  
  /**
   * Called before disconnecting
   */
  async beforeDisconnect(): Promise<void> {}
  
  /**
   * Called after disconnecting
   */
  async afterDisconnect(): Promise<void> {}
  
  /**
   * Called before destroying
   */
  async beforeDestroy(): Promise<void> {}
  
  /**
   * Called after destroying
   */
  async afterDestroy(): Promise<void> {}
  
  /**
   * Called during initialization
   * @returns Whether initialization was successful
   */
  async onInitialize(_options?: InitOptions): Promise<boolean> {
    return true;
  }
  
  /**
   * Called during start
   * @returns Whether start was successful
   */
  async onStart(): Promise<boolean> {
    return true;
  }
  
  /**
   * Called during stop
   * @returns Whether stop was successful
   */
  async onStop(): Promise<boolean> {
    return true;
  }
  
  /**
   * Called during destroy
   * @returns Whether destroy was successful
   */
  async onDestroy(): Promise<boolean> {
    return true;
  }
}
