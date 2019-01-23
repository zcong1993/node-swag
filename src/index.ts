import { parseDefinitions, parseFiles } from './parser'
import { rootConfig, Swag } from './types'
import { normalizeConfig } from './utils';

export const gen = async (config: rootConfig): Promise<Swag> => {
  config = normalizeConfig(config)
  // console.log(config)

  const res: Swag = {
    host: config.host,
    basePath: config.basePath,
    info: config.info,
    paths: {},
    swagger: '2.0'
  }
  if (config.model) {
    const definitions = await parseDefinitions(config.model)
    res.definitions = definitions
  }

  const paths = await parseFiles(config.files, config)

  res.paths = paths

  return res
}

// gen({
//   host: 'localhost:8080',
//   basePath: '/v1',
//   files: ['./zc/*.js'],
//   model: './zc/models.ts'
// })
//   .then(res => {
//     console.log(JSON.stringify(res))
//   })
