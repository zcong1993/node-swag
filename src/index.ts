import { parseDefinitions } from './parser'

const run = async () => {
  const res = await parseDefinitions('./zc/models.ts')
  console.log(JSON.stringify(res))
}

run()
