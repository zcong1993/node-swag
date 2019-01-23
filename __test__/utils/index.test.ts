import { normalizeConfig } from '../../src/utils'
import { RootConfig } from '../../src/types'

it('should works well', () => {
  const sample: RootConfig = {
    host: 'localhost:8080',
    basePath: '/v1',
    files: ['./src/*.js'],
    model: 'test.ts',
    outType: 'json'
  }

  expect(normalizeConfig(sample)).toMatchSnapshot()
})

it('should throw error', () => {
  const sample = {
    basePath: '/v1',
    files: ['./src/*.js'],
    model: 'test.ts',
    outType: 'json'
  }

  expect(() => normalizeConfig(sample as RootConfig)).toThrow()
})
