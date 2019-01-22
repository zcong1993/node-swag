export interface Definition {
  type?: string
  required?: string[]
  items?: Definition
  enum?: string[]
  $ref?: string
  properties?: {
    [key: string]: Definition
  }
}

export type Definitions = {
  [key: string]: Definition
}
