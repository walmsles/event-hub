import { BaseConnector } from '../connector';
import { EventHub } from '../event-hub';
import { ConnectorConfig } from '../types';

import { BaseFactory } from './base-factory';

/**
 * Factory for creating connector instances based on configuration
 */
export class ConnectorFactory extends BaseFactory<BaseConnector> {
  private eventHub: EventHub;
  
  /**
   * Creates a new ConnectorFactory
   * @param eventHub The EventHub instance to use for creating connectors
   */
  constructor(eventHub: EventHub) {
    super();
    this.eventHub = eventHub;
  }
  
  /**
   * Creates a connector instance from a configuration object
   * @param config The connector configuration
   * @returns A new connector instance
   * @throws Error if the connector type is not registered
   */
  public createFromConfig(config: ConnectorConfig): BaseConnector {
    const { type, options: configOptions = {} } = config;
    
    // Ensure the id and eventHub are passed to the connector constructor
    const connectorOptions = {
      ...configOptions,
      id: config.id,
      eventHub: this.eventHub
    };
    
    return super.create(type, connectorOptions);
  }
  
  /**
   * Creates a new connector instance after validating the configuration
   * @param config The connector configuration
   * @returns A new connector instance
   * @throws TypeError if the configuration is invalid
   * @throws Error if the connector type is not registered
   */
  public createWithValidation(config: ConnectorConfig): BaseConnector {
    this.validateConfig(config);
    return this.createFromConfig(config);
  }
  
  /**
   * Validates a connector configuration
   * @param config The connector configuration to validate
   * @returns true if the configuration is valid
   * @throws TypeError if the configuration is invalid
   */
  public validateConfig(config: ConnectorConfig): boolean {
    if (!config) {
      throw new TypeError('Connector configuration is required');
    }
    
    // Check for empty id first, then check if it exists
    if (config.id === '') {
      throw new TypeError('Connector id cannot be empty');
    } else if (!config.id) {
      throw new TypeError('Connector configuration must include an id');
    }
    
    // Check for type existence
    if (!config.type) {
      throw new TypeError('Connector configuration must include a type');
    }
    
    // Validate that the type is one of the allowed values
    if (config.type !== 'source' && config.type !== 'sink') {
      throw new TypeError("Connector type must be 'source' or 'sink'");
    }
    
    // If channel is provided, validate it's not empty
    if (config.options?.channel === '') {
      throw new TypeError('Connector channel cannot be empty when provided');
    }
    
    return true;
  }
}
