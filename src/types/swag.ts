import { Info, Security } from './rootConfig'
import { Definitions } from './definitions'

type Consumers =
  | 'application/json'
  | 'text/json'
  | 'application/xml'
  | 'text/xml'
  | 'application/x-www-form-urlencoded'
type Producers =
  | 'application/json'
  | 'text/json'
  | 'application/xml'
  | 'text/xml'
type ins = 'path' | 'query' | 'body'

interface Schema {
  $ref?: string
  type?: string
}

export interface SwaggerHttpEndpoint {
  tags: string[]
  summary?: string
  operationId?: string
  consumes: Consumers[]
  produces: Producers[]
  parameters: {
    name: string
    in: ins
    required: boolean
    description?: string
    type?: string
    maxLength?: number
    minLength?: number
  }[]
  respones: {
    [httpStatusCode: string]: {
      description: string
      schema?: Schema
    }
  }
  deprecated: boolean
}

export interface Swag extends Info {
  swagger: string
  host: string
  basePath: string
  definitions?: Definitions
  securityDefinitions?: {
    [key: string]: Security
  }
  paths: {
    [endpointPath: string]: {
      get?: SwaggerHttpEndpoint
      post?: SwaggerHttpEndpoint
      put?: SwaggerHttpEndpoint
      delete?: SwaggerHttpEndpoint
    }
  }
}
