import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'

import { SettingsFile, SetupType, UploadTool } from './init/types'
import { getProjectsList, exitWithError, FSNames } from '../utils'
import { list } from 'serialport'


export const checkProjectName = (projectName: string | undefined, cwd: string, settingsFile: SettingsFile) => {
  const { entryDir } = settingsFile.default
  const isMultipleSetup = settingsFile.setupType === SetupType.multiple;

  const projectsList = isMultipleSetup ? getProjectsList(cwd, entryDir) : null
  if (isMultipleSetup && projectName === undefined && projectsList !== null) {
    exitWithError('[project-name] is required for setup type multiple.', `Avaliable projects are: ${projectsList.join(', ')}`)
  }

  if (projectsList !== null && projectName !== undefined && !projectsList.includes(projectName)) {
    exitWithError(`Selected project '${projectName}' does not exist in ${entryDir}.`, `Avaliable projects are: ${projectsList.join(', ')}`)
  }
}

export const checkInitFileExists = (initFilePath: string) => {
  if (!fs.existsSync(initFilePath)) {
    exitWithError(`${initFilePath} does not exist.`)
  }
}

export const checkUploader = (settingsFile: SettingsFile) => {
  const { uploadToolBinary } = settingsFile.default
  if (uploadToolBinary !== UploadTool.nodemcuUploader && uploadToolBinary !== UploadTool.nodemcuTool) {
    exitWithError(`Unsupported uploader tool selected: ${uploadToolBinary}`)
  }
}

export const checkAndGetCompilerBinaryPath = (settingsFile: SettingsFile): string => {
  const { crossCompilerPath } = settingsFile.default
  if (crossCompilerPath === undefined) {
    exitWithError(`'crossCompilerPath' has to be set in order to upload with compilation. Try using '--no-compile' flag to upload raw lua bundle.`)
  }
  return crossCompilerPath as string
}

export const getInitFilePath = (projectName: string | undefined, settingsFile: SettingsFile) => {
  const { entryDir } = settingsFile.default
  return path.join(entryDir, projectName !== undefined ? projectName : '', FSNames.INIT)
}

export const determineDistDir = (settingsFile: SettingsFile, projectName: string | undefined) => {
  const { entryDir } = settingsFile.default
  const isMultipleSetup = settingsFile.setupType === SetupType.multiple;
  return isMultipleSetup && projectName !== undefined ? path.join(entryDir, projectName, FSNames.DIST) : `./${FSNames.DIST}`
}

export const getBundleFilePath = (distDirPath: string) => path.join(distDirPath, FSNames.BUNDLE)

export const prepareDistDir = (distDirPath: string) => {
  rimraf.sync(distDirPath)
  fs.mkdirSync(distDirPath)
}

export const findSerialPort = async (): Promise<string> => {
  const ports = await list()
  if (ports.length > 0) {
    const port = ports[0].path
    console.log(`No port provided. Using found port ${port}`)
    return port;
  } else {
    exitWithError('No available ports found')
    return ''
  }
}