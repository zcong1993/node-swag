import { Info, Security } from './rootConfig'
import { Definitions } from './definitions'

export type Consumers =
  | 'application/json'
  | 'text/json'
  | 'application/xml'
  | 'text/xml'
  | 'application/x-www-form-urlencoded'
export type Producers =
  | 'application/json'
  | 'text/json'
  | 'application/xml'
  | 'text/xml'
export type ins = 'path' | 'query' | 'body' | 'header'

interface Schema {
  $ref?: string
  type?: string
  items?: Schema
}

export interface SwaggerHttpEndpoint {
  tags?: string[]
  description?: string
  summary?: string
  operationId?: string
  consumes: string[]
  produces: string[]
  security?: { [key: string]: any }
  parameters?: {
    name: string
    in: string
    required: boolean
    description?: string
    type?: string
    maxLength?: number
    minLength?: number
    schema?: Schema
  }[]
  responses: {
    [httpStatusCode: string]: {
      description?: string
      schema?: Schema
    }
  }
  deprecated?: boolean
}

export interface Path {
  get?: SwaggerHttpEndpoint
  post?: SwaggerHttpEndpoint
  put?: SwaggerHttpEndpoint
  patch?: SwaggerHttpEndpoint
  delete?: SwaggerHttpEndpoint
}

export interface Paths {
  [endpointPath: string]: Path
}

export interface Swag {
  swagger: string
  host: string
  basePath: string
  info?: Info
  definitions?: Definitions
  securityDefinitions?: {
    [key: string]: Security
  }
  paths: Paths
}
