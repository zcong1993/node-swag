import { TypescriptParser, Declaration, InterfaceDeclaration, EnumDeclaration } from 'typescript-parser'
import { Definitions, Definition } from '../types'

const parser = new TypescriptParser()

const isInterfaceDeclaration = (t: Declaration): t is InterfaceDeclaration => {
  return 'accessors' in t && 'properties' in t && 'methods' in t
}

const isEnumDeclaration = (t: Declaration): t is EnumDeclaration => {
  return 'members' in t
}

const avaliableTypes: string[] = ['string', 'number', 'boolean', 'object', 'array']
const ignoredTypes: string[] = ['any']

export const parseDefinitions = async (filePath: string): Promise<Definitions> => {
  const res: Definitions = {}
  const { declarations } = await parser.parseFile(filePath, process.cwd())
  // console.log(declarations)
  const enums: {[key: string]: string[]} = {}
  const models: string[] = []

  declarations.forEach(declaration => {
    models.push(declaration.name)
    if(isEnumDeclaration(declaration)) {
      enums[declaration.name] = declaration.members
    }
  })

  declarations.forEach(declaration => {
    // console.log(declaration)
    if (isInterfaceDeclaration(declaration)) {
      const model: Definition = {
        type: 'object',
        properties: {}
      }
      const required: string[] = []
      declaration.properties.forEach(prop => {
        if (ignoredTypes.includes(prop.type)) {
          return
        }
        const isArray: boolean = prop.type.endsWith('[]')
        prop.type = prop.type.replace('[]', '')

        if (!prop.isOptional) {
          required.push(prop.name)
        }

        let m: Definition

        if (prop.type in enums) {
          m = {
            type: 'string',
            enum: enums[prop.type]
          }
        } else if (models.includes(prop.type)) {
          m = {
            '$ref': `#/definitions/${prop.type}`
          }
        } else if (avaliableTypes.includes(prop.type)) {
          m = {
            type: prop.type
          }
        } else {
          return
        }

        if (isArray) {
          model.properties[prop.name] = {
            type: 'array',
            items: m
          }
        } else {
          model.properties[prop.name] = m
        }
      })
      model.required = required
      res[declaration.name] = model
    }
  })
  return res
}
