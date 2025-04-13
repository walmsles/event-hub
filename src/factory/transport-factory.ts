/**
 * Transport factory implementation
 */
import { BaseTransport } from '../transport';
import { TransportConfig } from '../types';

import { BaseFactory } from './base-factory';

/**
 * Factory for creating transport instances
 */
export class TransportFactory extends BaseFactory<BaseTransport<unknown, unknown>> {
  /**
   * Create a transport instance with validation
   * 
   * @param config Transport configuration
   * @returns Transport instance
   */
  override createWithValidation(config: TransportConfig): BaseTransport<unknown, unknown> {
    // Validate required fields
    this.validateConfig(config);
    
    // Create the transport
    const transport = this.create(config.type, config);
    
    // Set the name if not already set
    if (!transport.name) {
      Object.defineProperty(transport, 'name', {
        value: config.id,
        writable: false
      });
    }
    
    return transport;
  }
  
  /**
   * Validate a transport configuration
   * 
   * @param config Transport configuration
   * @returns True if valid
   * @throws Error if invalid
   */
  override validateConfig(config: any): boolean {
    if (!config) {
      throw new TypeError('Transport configuration is required');
    }
    
    if (!config.id) {
      throw new TypeError('Transport configuration must include an id');
    }
    
    if (typeof config.id !== 'string' || config.id.trim() === '') {
      throw new TypeError('Transport id cannot be empty');
    }
    
    if (!config.type) {
      throw new TypeError('Transport configuration must include a type');
    }
    
    if (typeof config.type !== 'string' || config.type.trim() === '') {
      throw new TypeError('Transport type cannot be empty');
    }
    
    return true;
  }
  
  /**
   * Create from a configuration object
   * 
   * @param config Configuration object
   * @returns Created transport instance
   */
  createFromConfig(config: TransportConfig): BaseTransport<unknown, unknown> {
    this.validateConfig(config);
    return this.create(config.type, config);
  }
}
