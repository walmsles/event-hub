import { BaseTransport } from '../transport';
import { TransportConfig } from '../types';

import { BaseFactory } from './base-factory';

/**
 * Factory for creating transport instances based on configuration
 */
export class TransportFactory extends BaseFactory<BaseTransport<unknown, unknown>> {
  /**
   * Creates a transport instance from a configuration object
   * @param config The transport configuration
   * @returns A new transport instance
   * @throws Error if the transport type is not registered
   */
  public createFromConfig(config: TransportConfig): BaseTransport<unknown, unknown> {
    const { type, options: configOptions = {} } = config;
    
    // Ensure the id is passed to the transport constructor
    const transportOptions = {
      ...configOptions,
      id: config.id
    };
    
    return super.create(type, transportOptions);
  }
  
  /**
   * Creates a new transport instance after validating the configuration
   * @param config The transport configuration
   * @returns A new transport instance
   * @throws TypeError if the configuration is invalid
   * @throws Error if the transport type is not registered
   */
  public createWithValidation(config: TransportConfig): BaseTransport<unknown, unknown> {
    this.validateConfig(config);
    return this.createFromConfig(config);
  }
  
  /**
   * Validates a transport configuration
   * @param config The transport configuration to validate
   * @returns true if the configuration is valid
   * @throws TypeError if the configuration is invalid
   */
  public validateConfig(config: TransportConfig): boolean {
    if (!config) {
      throw new TypeError('Transport configuration is required');
    }
    
    // Check for empty id first, then check if it exists
    if (config.id === '') {
      throw new TypeError('Transport id cannot be empty');
    } else if (!config.id) {
      throw new TypeError('Transport configuration must include an id');
    }
    
    // Check for empty type first, then check if it exists
    if (config.type === '') {
      throw new TypeError('Transport type cannot be empty');
    } else if (!config.type) {
      throw new TypeError('Transport configuration must include a type');
    }
    
    return true;
  }
}
