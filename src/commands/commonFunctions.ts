import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'

import { SettingsFile, SetupType } from './init/types'
import { getProjectsList, exitWithError, FSNames } from '../utils'


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