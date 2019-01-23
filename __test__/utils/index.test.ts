import { normalizeConfig } from '../../src/utils'
import { RootConfig } from '../../src/types'

it('should works well', () => {
  const samples: RootConfig[] = [
    {
      host: 'localhost:8080',
      basePath: '/v1',
      files: ['./src/*.js'],
      model: 'test.ts',
      outType: 'json'
    },
    {
      host: 'localhost:8080',
      files: ['./src/*.js'],
      model: 'test.ts',
      outType: 'json'
    },
    {
      host: 'localhost:8080',
      basePath: '/v1',
      files: ['./src/*.js'],
      model: 'test.ts',
      outType: 'json',
      info: {}
    },
    {
      host: 'localhost:8080',
      files: ['./src/*.js'],
      model: 'test.ts',
      outType: 'yaml'
    },
    {
      host: 'localhost:8080',
      files: ['./src/*.js'],
      model: 'test.ts',
      outType: 'json',
      outDir: './out'
    }
  ]

  samples.forEach(sample => expect(normalizeConfig(sample)).toMatchSnapshot())
})

it('should throw error', () => {
  const samples = [
    {
      basePath: '/v1',
      files: ['./src/*.js'],
      model: 'test.ts',
      outType: 'json'
    },
    {
      host: 'localhost:8080',
      basePath: '/v1',
      model: 'test.ts',
      outType: 'json'
    }
  ]

  samples.forEach(sample => expect(() => normalizeConfig(sample as RootConfig)).toThrow())
})
