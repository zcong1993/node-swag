import { parseDefinitions, parseFiles } from './parser'
import { rootConfig, Swag } from './types'

export const gen = async (config: rootConfig): Promise<Swag> => {
  const {
    host,
    basePath = '/',
    info = {
      title: 'Swagger API',
      version: 'v0.0.0'
    },
    securityDefinitions,
    files,
    model
  } = config

  const res: Swag = {
    host,
    basePath,
    info,
    paths: {},
    swagger: '2.0'
  }
  if (model) {
    const definitions = await parseDefinitions(model)
    res.definitions = definitions
  }

  const paths = await parseFiles(files, config)

  res.paths = paths

  return res
}

// gen({
//   host: 'localhost:8080',
//   basePath: '/v1',
//   files: ['./zc/test.js'],
//   model: './zc/models.ts'
// })
//   .then(res => {
//     console.log(JSON.stringify(res))
//   })
