/**
 * Tests for the system channels utility functions
 */
import { 
  ComponentType, 
  ConfigEventType,
  getConfigChannel,
  getConnectorStateChannel, 
  getLifecycleChannel, 
  getStateChannel, 
  getTransportStateChannel, 
  LifecycleEventType, 
  SYSTEM_CHANNELS 
} from './system-channels';

describe('System Channels', () => {
  describe('when using SYSTEM_CHANNELS constants', () => {
    it('should provide transport root channel', () => {
      expect(SYSTEM_CHANNELS.TRANSPORT.ROOT).toBe('system:transport');
    });

    it('should provide transport state channel', () => {
      expect(SYSTEM_CHANNELS.TRANSPORT.STATE).toBe('system:transport:state');
    });

    it('should provide connector root channel', () => {
      expect(SYSTEM_CHANNELS.CONNECTOR.ROOT).toBe('system:connector');
    });

    it('should provide connector state channel', () => {
      expect(SYSTEM_CHANNELS.CONNECTOR.STATE).toBe('system:connector:state');
    });

    it('should provide eventhub root channel', () => {
      expect(SYSTEM_CHANNELS.EVENTHUB.ROOT).toBe('system:eventhub');
    });

    it('should provide eventhub state channel', () => {
      expect(SYSTEM_CHANNELS.EVENTHUB.STATE).toBe('system:eventhub:state');
    });

    it('should provide config root channel', () => {
      expect(SYSTEM_CHANNELS.CONFIG.ROOT).toBe('system:config');
    });
    
    it('should provide config set channel', () => {
      expect(SYSTEM_CHANNELS.CONFIG.SET).toBe('system:config:set');
    });
    
    it('should provide config get channel', () => {
      expect(SYSTEM_CHANNELS.CONFIG.GET).toBe('system:config:get');
    });
    
    it('should provide config validate channel', () => {
      expect(SYSTEM_CHANNELS.CONFIG.VALIDATE).toBe('system:config:validate');
    });
    
    it('should provide config apply channel', () => {
      expect(SYSTEM_CHANNELS.CONFIG.APPLY).toBe('system:config:apply');
    });
    
    it('should provide config error channel', () => {
      expect(SYSTEM_CHANNELS.CONFIG.ERROR).toBe('system:config:error');
    });
  });

  describe('when getting transport state channel', () => {
    it('should format channel with transport ID', () => {
      const transportId = 'test-transport';
      const channel = getTransportStateChannel(transportId);
      expect(channel).toBe(`system:transport:state/${transportId}`);
    });
  });

  describe('when getting connector state channel', () => {
    it('should format channel with connector ID', () => {
      const connectorId = 'test-connector';
      const channel = getConnectorStateChannel(connectorId);
      expect(channel).toBe(`system:connector:state/${connectorId}`);
    });
  });

  describe('when getting component state channel', () => {
    it('should return transport state channel for transport component', () => {
      const componentId = 'test-transport';
      const channel = getStateChannel('transport', componentId);
      expect(channel).toBe(`system:transport:state/${componentId}`);
    });

    it('should return connector state channel for connector component', () => {
      const componentId = 'test-connector';
      const channel = getStateChannel('connector', componentId);
      expect(channel).toBe(`system:connector:state/${componentId}`);
    });

    it('should return eventhub state channel for eventhub component', () => {
      const channel = getStateChannel('eventhub', 'any-id');
      expect(channel).toBe('system:eventhub:state');
    });

    it('should handle unknown component types', () => {
      const componentId = 'test-unknown';
      const componentType = 'unknown' as ComponentType;
      const channel = getStateChannel(componentType, componentId);
      expect(channel).toBe(`system:${componentType}:state/${componentId}`);
    });
  });

  describe('when getting lifecycle channel', () => {
    it('should return initialize channel for transport', () => {
      const event: LifecycleEventType = 'initialize';
      const componentType: ComponentType = 'transport';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.TRANSPORT.INITIALIZE);
    });

    it('should return start channel for transport', () => {
      const event: LifecycleEventType = 'start';
      const componentType: ComponentType = 'transport';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.TRANSPORT.START);
    });

    it('should return stop channel for transport', () => {
      const event: LifecycleEventType = 'stop';
      const componentType: ComponentType = 'transport';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.TRANSPORT.STOP);
    });

    it('should return destroy channel for transport', () => {
      const event: LifecycleEventType = 'destroy';
      const componentType: ComponentType = 'transport';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.TRANSPORT.DESTROY);
    });

    it('should return error channel for transport', () => {
      const event: LifecycleEventType = 'error';
      const componentType: ComponentType = 'transport';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.TRANSPORT.ERROR);
    });

    it('should return initialize channel for connector', () => {
      const event: LifecycleEventType = 'initialize';
      const componentType: ComponentType = 'connector';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.CONNECTOR.INITIALIZE);
    });

    it('should return start channel for connector', () => {
      const event: LifecycleEventType = 'start';
      const componentType: ComponentType = 'connector';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.CONNECTOR.START);
    });

    it('should return stop channel for connector', () => {
      const event: LifecycleEventType = 'stop';
      const componentType: ComponentType = 'connector';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.CONNECTOR.STOP);
    });

    it('should return destroy channel for connector', () => {
      const event: LifecycleEventType = 'destroy';
      const componentType: ComponentType = 'connector';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.CONNECTOR.DESTROY);
    });

    it('should return error channel for connector', () => {
      const event: LifecycleEventType = 'error';
      const componentType: ComponentType = 'connector';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.CONNECTOR.ERROR);
    });

    it('should return initialize channel for eventhub', () => {
      const event: LifecycleEventType = 'initialize';
      const componentType: ComponentType = 'eventhub';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.EVENTHUB.INITIALIZE);
    });

    it('should return start channel for eventhub', () => {
      const event: LifecycleEventType = 'start';
      const componentType: ComponentType = 'eventhub';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.EVENTHUB.START);
    });

    it('should return stop channel for eventhub', () => {
      const event: LifecycleEventType = 'stop';
      const componentType: ComponentType = 'eventhub';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.EVENTHUB.STOP);
    });

    it('should return destroy channel for eventhub', () => {
      const event: LifecycleEventType = 'destroy';
      const componentType: ComponentType = 'eventhub';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.EVENTHUB.DESTROY);
    });

    it('should return error channel for eventhub', () => {
      const event: LifecycleEventType = 'error';
      const componentType: ComponentType = 'eventhub';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.EVENTHUB.ERROR);
    });

    it('should return root channel for unknown event type', () => {
      const event = 'unknown' as LifecycleEventType;
      const componentType: ComponentType = 'transport';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.TRANSPORT.ROOT);
    });
    
    it('should return root channel for unknown event type with connector component', () => {
      const event = 'unknown' as LifecycleEventType;
      const componentType: ComponentType = 'connector';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.CONNECTOR.ROOT);
    });
    
    it('should return root channel for unknown event type with eventhub component', () => {
      const event = 'unknown' as LifecycleEventType;
      const componentType: ComponentType = 'eventhub';
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(SYSTEM_CHANNELS.EVENTHUB.ROOT);
    });

    it('should return generic channel for unknown component type', () => {
      const event: LifecycleEventType = 'initialize';
      const componentType = 'unknown' as ComponentType;
      const channel = getLifecycleChannel(event, componentType);
      expect(channel).toBe(`system:${componentType}:${event}`);
    });

    it('should append component ID when provided', () => {
      const event: LifecycleEventType = 'initialize';
      const componentType: ComponentType = 'transport';
      const componentId = 'test-transport';
      const channel = getLifecycleChannel(event, componentType, componentId);
      expect(channel).toBe(`${SYSTEM_CHANNELS.TRANSPORT.INITIALIZE}/${componentId}`);
    });
    
    it('should handle unknown event and component types with ID', () => {
      const event = 'unknown' as LifecycleEventType;
      const componentType = 'unknown' as ComponentType;
      const componentId = 'test-id';
      const channel = getLifecycleChannel(event, componentType, componentId);
      expect(channel).toBe(`system:${componentType}:${event}/${componentId}`);
    });
  });
  
  describe('when getting config channel', () => {
    it('should return set channel', () => {
      const event: ConfigEventType = 'set';
      const channel = getConfigChannel(event, 'transport');
      expect(channel).toBe('system:config:set:transport');
    });
    
    it('should return get channel', () => {
      const event: ConfigEventType = 'get';
      const channel = getConfigChannel(event, 'connector');
      expect(channel).toBe('system:config:get:connector');
    });
    
    it('should return validate channel', () => {
      const event: ConfigEventType = 'validate';
      const channel = getConfigChannel(event, 'eventhub');
      expect(channel).toBe('system:config:validate:eventhub');
    });
    
    it('should return apply channel', () => {
      const event: ConfigEventType = 'apply';
      const channel = getConfigChannel(event, 'transport');
      expect(channel).toBe('system:config:apply:transport');
    });
    
    it('should return error channel', () => {
      const event: ConfigEventType = 'error';
      const channel = getConfigChannel(event, 'connector');
      expect(channel).toBe('system:config:error:connector');
    });
    
    it('should return root channel for unknown event type', () => {
      const event = 'unknown' as ConfigEventType;
      const channel = getConfigChannel(event, 'eventhub');
      expect(channel).toBe('system:config:eventhub');
    });
    
    it('should append component ID when provided', () => {
      const event: ConfigEventType = 'set';
      const componentType: ComponentType = 'transport';
      const componentId = 'test-transport';
      const channel = getConfigChannel(event, componentType, componentId);
      expect(channel).toBe('system:config:set:transport:test-transport');
    });
    
    it('should handle missing component type', () => {
      const event: ConfigEventType = 'get';
      const channel = getConfigChannel(event);
      expect(channel).toBe('system:config:get');
    });
    
    it('should handle all config event types', () => {
      // Test all possible config event types
      const events: ConfigEventType[] = ['set', 'get', 'validate', 'apply', 'error'];
      events.forEach(event => {
        const channel = getConfigChannel(event);
        expect(channel).toBe(`system:config:${event}`);
      });
    });
  });
});
