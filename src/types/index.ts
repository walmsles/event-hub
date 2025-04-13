/**
 * Type definitions for the EventHub system
 * 
 * @description
 * This file exports all types used throughout the EventHub system.
 */

// Re-export all types from the individual files
export * from './config';
export * from './events';
export * from './lifecycle';
export * from './system-channels';

/**
 * Subscription interface for EventHub subscribers
 */
export interface Subscription {
  /**
   * Unsubscribe from the channel
   */
  unsubscribe(): void;
  
  /**
   * The channel this subscription is for
   */
  readonly channel: string;
  
  /**
   * Whether this subscription is active
   */
  readonly active: boolean;
}

/**
 * Pipeline result interface
 */
export interface PipelineResult<T> {
  /**
   * Whether the pipeline stage was successful
   */
  success: boolean;
  
  /**
   * The transformed data if successful
   */
  data?: T;
  
  /**
   * The error if unsuccessful
   */
  error?: Error;
}

/**
 * Pipeline filter interface
 */
export interface IPipelineFilter<TInput, TOutput> {
  /**
   * Process the input data and return a result
   * 
   * @param data The input data to process
   * @returns A promise that resolves to a pipeline result
   */
  process(data: TInput): Promise<PipelineResult<TOutput>>;
}
