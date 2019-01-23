import { rootConfig } from '../types'

export const validateConfig = (config: rootConfig) => {
  if (!config.host) {
    throw new Error('host is required')
  }
  if (!Array.isArray(config.files) || config.files.length === 0) {
    throw new Error('files should be array and not be none')
  }
}
