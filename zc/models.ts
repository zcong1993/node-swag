export interface Test {
  name?: string[]
  age: number
}

export interface Student {
  type: string
  test: Test[]
  color: Color[]
}

export enum Color {
  Red,
  Green
}

export type a = string
