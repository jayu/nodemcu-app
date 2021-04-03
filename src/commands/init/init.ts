import prompts from 'prompts'
import path from 'path'
import fs from 'fs'
import rimraf from 'rimraf'

import questions from './questions'

import {
  Answers,
  YesOrLater,
  SetupType,
  SettingsFile
} from './types';

import * as templates from './templates'

export const createProject = (response: Answers) => {
  const tempDirPath = fs.mkdtempSync('nodemcu-app')
  try {
    let crossCompilerPath = ''

    if (
      response.useCrossCompiler === YesOrLater.yes &&
      response.crossCompilerPath !== undefined
    ) {
      if (response.copyLuaCross) {
        crossCompilerPath = './luac.cross'
        fs.copyFileSync(
          response.crossCompilerPath,
          path.join(tempDirPath, crossCompilerPath)
        )
      } else {
        crossCompilerPath = response.crossCompilerPath
      }
    }
    const moduleDirs: string[] = []

    if (response.setupType === SetupType.multiple && response.commonModulesDir) {
      moduleDirs.push(`./${response.commonModulesDir}`)
    }

    if (response.useLuaRocks === YesOrLater.yes && response.luaRocksModulesDir) {
      moduleDirs.push(`./${response.luaRocksModulesDir}`)
    }

    const entryDir =
      response.setupType === SetupType.multiple
        ? `./${response.projectsSubDir}`
        : './src'

    const settingsJSON: SettingsFile = {
      setupType: response.setupType,
      manifestVersion: '1.0',
      default: {
        entryDir,
        moduleDirs,
        crossCompilerPath,
        uploadToolBinary: response.uploadTool
      }
    }

    const dirsToCreate = [...moduleDirs, entryDir]
    // Create all sub-directories
    dirsToCreate.forEach((dir) => {
      fs.mkdirSync(path.join(tempDirPath, dir))
    })

    // Save settings.json file
    const settingsJSONString = JSON.stringify(settingsJSON, undefined, 2)
    fs.writeFileSync(
      path.join(tempDirPath, 'settings.json'),
      settingsJSONString
    )

    // Create an example module
    fs.writeFileSync(
      path.join(
        tempDirPath,
        response.setupType === SetupType.multiple && response.commonModulesDir
          ? response.commonModulesDir
          : entryDir,
        `${templates.exampleModuleName}.lua`
      ),
      templates.exampleModule
    )

    // Create initial project directory for multiple setup
    const exampleProjectDirectory =
      response.setupType === SetupType.multiple ? 'example-project' : ''

    if (exampleProjectDirectory !== '') {
      fs.mkdirSync(path.join(tempDirPath, entryDir, exampleProjectDirectory))
    }

    // Create example project entry file
    fs.writeFileSync(
      path.join(tempDirPath, entryDir, exampleProjectDirectory, 'init.lua'),
      templates.exampleInitFile
    )

    // Create gitignore for dist directories
    fs.writeFileSync(
      path.join(tempDirPath, '.gitignore'),
      templates.gitignore
    )

    // Move temp directory to target project directory
    fs.renameSync(tempDirPath, response.projectDir)
    return {
      success: true,
      dirName: `./${response.projectDir}`,
      settingsString: settingsJSONString
    }
  } catch (error) {
    rimraf.sync(tempDirPath)
    return {
      success: false,
      error
    }
  }
}

async function init() {
  let promptsCancelled = false
  const onCancel = () => {
    promptsCancelled = true
  }
  const response: Answers = (await prompts(questions, { onCancel })) as any
  if (!promptsCancelled) {
    const { success, dirName, settingsString, error } = createProject(response)
    if (success) {
      console.log(`Project created in ${dirName}`)
      console.log('With settings:\n', settingsString)
    }
    else {
      console.error('An error occurred during project setup:', error)
    }
  }
  else {
    console.log('Cancelled project creation')
  }
}

export default init
