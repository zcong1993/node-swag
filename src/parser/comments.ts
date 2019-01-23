import * as fs from 'fs'
import { promisify } from 'util'
import commentParser = require('comment-parser')

import {
  Paths,
  Path,
  SwaggerHttpEndpoint,
  RootConfig,
  isApiKeyAuth
} from '../types'

const readFile = promisify(fs.readFile.bind(fs))

const normalizeString = (source: string, tag: string): string => {
  return source.replace(`@${tag} `, '')
}

const normalizeArray = (source: string, tag: string): string[] => {
  return source
    .replace(`@${tag} `, '')
    .split(' ')
    .map(s => s.trim())
}

const consumers: string[] = [
  'application/json',
  'text/json',
  'application/xml',
  'text/xml',
  'application/x-www-form-urlencoded'
]

const produces: string[] = [
  'application/json',
  'text/json',
  'application/xml',
  'text/xml'
]

const ins: string[] = ['query', 'path', 'body', 'header']
const simpleIns: string[] = ['query', 'path', 'header']

const parseBool = (str: string): boolean => {
  return str === 'true'
}

const merge = (...ins: object[]): object => {
  return ins.reduce(
    (a, b) => ({
      ...a,
      ...b
    }),
    Object.create(null)
  )
}

export const parseFile = async (
  fileName: string,
  config: RootConfig
): Promise<Paths> => {
  const content: string = await readFile(fileName, 'utf8')
  return parseCode(content, config)
}

export const parseFiles = async (
  fileNames: string[],
  config: RootConfig
): Promise<Paths> => {
  const ps = await Promise.all(fileNames.map(f => parseFile(f, config)))
  return merge(...ps) as Paths
}

export const parseCode = (code: string, config: RootConfig): Paths => {
  const comments = commentParser(code)
  const res: Paths = {}
  comments.forEach(comment => {
    const router = comment.tags.filter(t => t.tag === 'router')
    if (router.length !== 1) {
      return
    }

    const r = router[0]
    const p: string = r.name
    const c: Path = res[p] || {}
    const method = r.description

    const h: SwaggerHttpEndpoint = {
      consumes: [],
      produces: [],
      responses: {}
    }

    // console.log(JSON.stringify(comment.tags))

    comment.tags.forEach(t => {
      switch (t.tag) {
        case 'summary':
          h.summary = normalizeString(t.source, t.tag)
          break
        case 'tags':
          const tags: string[] = normalizeArray(t.source, t.tag)
          h.tags = tags
          break
        case 'description':
          h.description = normalizeString(t.source, t.tag)
          break
        case 'accept':
          const accepts: string[] = normalizeArray(t.source, t.tag).filter(s =>
            consumers.includes(s)
          )
          h.consumes = accepts
          break
        case 'produce':
          const pds: string[] = normalizeArray(t.source, t.tag).filter(s =>
            produces.includes(s)
          )
          h.produces = pds
          break
        case 'success':
        case 'failure': {
          // console.log(111, normalizeString(t.source, t.tag))
          const source = normalizeString(t.source, t.tag)
          const reg = /([\d]+)[\s]+([\w\{\}\[\]]+)[\s]+([\w\-\.\/]+)[^"]*(.*)?/g
          const res = reg.exec(source)
          h.responses[t.name] = {}
          if (!res) {
            // ([\d]+)[\s]+[^"]*(.*)? for 204 "update success"
            const simpleReg = /([\d]+)[\s]+[^"]*(.*)?/g
            const simpleRes = simpleReg.exec(source)
            if (!simpleReg) return
            const simpleFields = simpleRes.filter(Boolean)
            simpleFields.shift()
            if (simpleFields.length !== 2) return
            h.responses[t.name]['description'] = simpleFields[1]
            return
          }
          const fields = res.filter(Boolean)
          fields.shift()
          // console.log(fields, fields.length)
          // console.log(t.name)
          if (fields.length === 2) {
            // code desc
            h.responses[t.name]['description'] = fields[1]
          } else if (fields.length === 3 || fields.length === 4) {
            // code type typeName
            if (fields.length === 4) {
              h.responses[t.name]['description'] = fields[3]
            }
            if (fields[1].startsWith('{')) {
              const type = fields[1].replace(/{|}|[|]/g, '')
              // console.log(type)
              h.responses[t.name]['schema'] = { type }
              // console.log(h.responses[t.name]['schema'])
              if (fields[2].startsWith('def.')) {
                h.responses[t.name]['schema']['$ref'] = fields[2].replace(
                  'def.',
                  '#/definitions/'
                )
              }
            } else if (fields[1].startsWith('[')) {
              h.responses[t.name]['schema'] = {
                type: 'array',
                items: {}
              }

              if (fields[2].startsWith('def.')) {
                h.responses[t.name]['schema']['items'][
                  '$ref'
                ] = fields[2].replace('def.', '#/definitions/')
              }
            }
          }
          break
        }
        case 'security':
          if (
            config.securityDefinitions &&
            t.name in config.securityDefinitions
          ) {
            if (isApiKeyAuth(config.securityDefinitions[t.name])) {
              h.security = [
                {
                  [t.name]: []
                }
              ]
            }
          }
          break
        case 'param': {
          const reg = /([-\w]+)[\s]+([\w]+)[\s]+([\S.]+)[\s]+([\w]+)[\s]+"([^"]+)"/g
          const res = reg.exec(normalizeString(t.source, t.tag))
          if (!res) {
            return
          }
          const fields = res.filter(Boolean)
          fields.shift()
          // console.log(fields, fields.length)
          if (fields.length !== 5) {
            return
          }
          if (!h.parameters) {
            h.parameters = []
          }
          if (simpleIns.includes(fields[1])) {
            h.parameters.push({
              name: fields[0],
              type: fields[2],
              in: fields[1],
              required: parseBool(fields[3]),
              description: fields[4]
            })
          } else if (fields[1] === 'body') {
            if (!fields[2].startsWith('def.')) {
              return
            }
            const p = {
              name: fields[0],
              // type: fields[2],
              in: fields[1],
              required: parseBool(fields[3]),
              description: fields[4],
              schema: {
                type: 'object',
                $ref: fields[2].replace('def.', '#/definitions/')
              }
            }

            h.parameters.push(p)
          }
          break
        }
        default:
          return
      }
    })

    switch (method) {
      case 'get':
        c.get = h
        break
      case 'post':
        c.post = h
        break
      case 'delete':
        c.delete = h
        break
      case 'put':
        c.put = h
        break
      case 'patch':
        c.patch = h
        break
      default:
        return
    }

    res[p] = c
  })

  return res
}
