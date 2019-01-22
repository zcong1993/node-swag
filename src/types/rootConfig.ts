export interface BasicAuth {
  type: string
}

export interface ApiKeyAuth {
  type: string
  in: string
  name: string
}

export type Security = BasicAuth | ApiKeyAuth

export const isBasicAuth = (t: Security): t is BasicAuth => {
  return 'type' in t && !('in' in t)
}

export const isApiKeyAuth = (t: Security): t is ApiKeyAuth => {
  return 'name' in t && 'in' in t
}

interface Info {
  title?: string
  version?: string
  description?: string
  termsOfService?: string
  license?: {
    name?: string
    url?: string
  }
  contract?: {
    email?: string
    name?: string
    url?: string
  }
}

export interface rootConfig {
  host?: string
  basePath?: string
  info?: Info
  securityDefinitions?: {
    [key: string]: Security
  }
}
