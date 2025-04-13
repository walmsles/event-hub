import { BaseFactory, FactoryRegistry } from './factory/base-factory';
import { TransportFactory } from './factory/transport-factory';
import { Channel } from './channel';
import { EventHub } from './event-hub';
import { IPipelineFilter, Pipeline, PipelineResult } from './pipeline';
import { BaseTransport, ITransport, SinkTransport, SourceTransport } from './transport';
import { ConnectionState,ConnectorConfig, EventCallback, EventHubConfig, Subscription, TransportConfig } from './types';

/**
 * Core components for event handling and communication
 */
export { 
    BaseFactory,
    BaseTransport,
    Channel,
    ConnectionState,
    ConnectorConfig,
    EventCallback,
    EventHub,
    EventHubConfig,
    FactoryRegistry,
    IPipelineFilter,
    ITransport,
    Pipeline,
    PipelineResult,
    SinkTransport,
    SourceTransport,
    Subscription,
    TransportConfig,
    TransportFactory,
};
