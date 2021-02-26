import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import dedent from 'dedent'

import { getAbsolutePath, exitWithError } from '../../utils'

// const getAbsolutePath = (p: string) => path.resolve(__dirname, '../', p)
const createLookupPath = (path: string) => [`${path}/*.lua`, `${path}/*/init.lua`].map(getAbsolutePath)

const getLuarocksPaths = () => {
  const basePath = path.resolve(process.cwd(), 'luarocks_modules/share/lua')
  const basePathExist = fs.existsSync(basePath)
  if (basePathExist) {
    const luaVersions = fs.readdirSync(basePath)
    return luaVersions.map((version) => path.join(basePath, version))
  }
  return undefined
}

type ModulesMap = { [key: string]: string }

type BundleResult = [string, string[], ModulesMap]

export const bundleFile = (entryFilePath: string, modulesLookupPaths = [] as string[], bundledModules = {} as ModulesMap): BundleResult => {
  const entryDirName = path.dirname(entryFilePath)
  if (modulesLookupPaths.length === 0) {
    modulesLookupPaths = [...createLookupPath('./modules')]
    const luaRocksPaths = getLuarocksPaths()
    if (luaRocksPaths !== undefined) {
      luaRocksPaths.forEach((luarockPath) => {
        modulesLookupPaths.push(...createLookupPath(luarockPath))
      })
    }
  }
  modulesLookupPaths = [...modulesLookupPaths, ...createLookupPath(entryDirName)]
  const fileContent = fs.readFileSync(entryFilePath).toString()
  const lines = fileContent.split('\n')
  const hoistedModules: string[] = []
  const bundleLines = lines.map((line) => {
    const requireStatement = line.match(/require\((.)+\)/)
    if (requireStatement !== null) {
      const moduleName = requireStatement[0].replace(/require\(('|")/, '').replace(/('|")\)/, '')
      const modulePath = moduleName.replace(/\./g, '/')
      const moduleCandidates = modulesLookupPaths.map((p) => p.replace('*', modulePath)).filter((moduleCandidatePath) => fs.existsSync(moduleCandidatePath))
      if (moduleCandidates.length > 0) {
        const modulePath = moduleCandidates[0]
        if (bundledModules[modulePath] === undefined) {
          const moduleHash = `m${crypto.createHash('md5').update(modulePath).digest('hex')}`
          const [code, subModulesToHoist, subBundledModules] = bundleFile(modulePath, modulesLookupPaths, { ...bundledModules })
          const moduleToHoist = dedent`
          function ${moduleHash}()
            ${code}
          end
          `
          hoistedModules.push(...subModulesToHoist)
          hoistedModules.push(moduleToHoist)
          bundledModules = {
            ...bundledModules,
            [modulePath]: moduleHash,
            ...subBundledModules
          }
        }
        return line.replace(/require\((.)+\)/, `${bundledModules[modulePath]}()`)
      }
      else {
        exitWithError(`Module '${moduleName}' does not exist!`)
      }
    }
    else {
      return line
    }
  })
  return [bundleLines.join('\n'), hoistedModules, bundledModules]
}

const bundle = (entryFilePath: string, moduleDirs = [] as string[]) => {
  const moduleLookupPaths = moduleDirs.map(createLookupPath).reduce((lookupPaths, flatList) => [...flatList, ...lookupPaths], [])
  const [code, modulesToHoist] = bundleFile(entryFilePath, moduleLookupPaths)
  const program = dedent`
  ${modulesToHoist.join('\n')}
  ${code}
  `
  return program
}

export default bundle