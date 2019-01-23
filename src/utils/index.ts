import { sync as fg } from 'fast-glob'
import { rootConfig } from '../types'

export const validateConfig = (config: rootConfig) => {
  if (!config.host) {
    throw new Error('host is required')
  }
  if (!Array.isArray(config.files) || config.files.length === 0) {
    throw new Error('files should be array and not be none')
  }
}

export const normalizeConfig = (config: rootConfig): rootConfig => {
  validateConfig(config)

  if (!config.basePath) {
    config.basePath = '/'
  }

  if (!config.info) {
    config.info = {
      title: 'Swagger API',
      version: 'v0.0.0'
    }
  } else {
    config.info.title = config.info.title || 'Swagger API'
    config.info.version = config.info.version || 'v0.0.0'
  }

  if (config.outType !== 'yaml') {
    config.outType = 'json'
  }

  if (!config.outDir) {
    config.outDir = './.swag'
  }

  config.files.push('!**/node_modules')
  config.files = fg(config.files)

  return config
}
