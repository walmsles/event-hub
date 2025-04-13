/**
 * Connector factory implementation
 */
import { BaseConnector } from '../connector';
import { EventHub } from '../event-hub';
import { ConnectorConfig } from '../types';

import { BaseFactory } from './base-factory';

/**
 * Factory for creating connector instances
 */
export class ConnectorFactory extends BaseFactory<BaseConnector> {
  /**
   * EventHub instance
   */
  private eventHub: EventHub;
  
  /**
   * Create a connector factory
   * 
   * @param eventHub EventHub instance
   */
  constructor(eventHub: EventHub) {
    super();
    this.eventHub = eventHub;
  }
  
  /**
   * Create a connector instance with validation
   * 
   * @param config Connector configuration
   * @returns Connector instance
   */
  override createWithValidation(config: ConnectorConfig): BaseConnector {
    // Validate required fields
    this.validateConfig(config);
    
    // Add the EventHub to the options
    const options = {
      ...config,
      eventHub: this.eventHub
    };
    
    // Create the connector
    return this.create(config.type, options);
  }
  
  /**
   * Validate a connector configuration
   * 
   * @param config Connector configuration
   * @returns True if valid
   * @throws Error if invalid
   */
  override validateConfig(config: any): boolean {
    if (!config) {
      throw new TypeError('Connector configuration is required');
    }
    
    if (!config.id) {
      throw new TypeError('Connector configuration must include an id');
    }
    
    if (typeof config.id !== 'string' || config.id.trim() === '') {
      throw new TypeError('Connector id cannot be empty');
    }
    
    if (!config.type) {
      throw new TypeError('Connector configuration must include a type');
    }
    
    if (typeof config.type !== 'string' || config.type.trim() === '') {
      throw new TypeError('Connector type cannot be empty');
    }
    
    if (config.type !== 'source' && config.type !== 'sink' && config.type !== 'both') {
      throw new TypeError("Connector type must be 'source' or 'sink'");
    }
    
    // Check channel if provided
    if (config.options && config.options.channel !== undefined) {
      if (typeof config.options.channel !== 'string' || config.options.channel.trim() === '') {
        throw new TypeError('Connector channel cannot be empty when provided');
      }
    }
    
    return true;
  }
  
  /**
   * Create from a configuration object
   * 
   * @param config Configuration object
   * @returns Created connector instance
   */
  createFromConfig(config: ConnectorConfig): BaseConnector {
    this.validateConfig(config);
    
    // Add the EventHub to the options
    const options = {
      ...config,
      eventHub: this.eventHub
    };
    
    return this.create(config.type, options);
  }
}
