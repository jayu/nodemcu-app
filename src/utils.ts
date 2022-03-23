import path from 'path'
import fs from 'fs'
import { SettingsFile } from './commands/init/types'
import { URL } from 'url'

export const getAbsolutePath = (value: string) => {
  return path.isAbsolute(value) ? value : path.join(process.cwd(), value)
}

export const resolveSettingsFile = (cwd: string): SettingsFile | never => {
  const filePath = path.join(cwd, 'settings.json')
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath).toString())
  }
  return exitWithError(`Settings.json file not found in '${cwd}'`)
}

export const getProjectsList = (
  rootDirPath: string,
  projectsDirectory: string
): string[] => {
  return fs.readdirSync(path.join(rootDirPath, projectsDirectory))
}

export const exitWithError = (...errorMessages: string[]) => {
  errorMessages.forEach((msg) => console.log(msg))
  process.exit(1)
}

export const noExt = (luaFileName: string) =>
  luaFileName.replace(/(\.lua)|(\.lc)/, '')

export enum FSNames {
  BUNDLE = 'bundle.lua',
  INIT = 'init.lua',
  INIT_BYTE_CODE = 'init.lc',
  DIST = 'dist',
  LFS_LOADER_INIT = '_init.lua',
  LFS_IMG = 'lfs.img'
}

export const defaultBaudRate = 115200

//eslint-disable-next-line
const pkg = require('../package.json')

export const version: string = pkg.version

export const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch (_) {
    return false
  }
}
