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

    if (response.setupType === SetupType.multiple) {
      moduleDirs.push(`./${response.commonModulesDir}`)
    }

    if (response.useLuaRocks) {
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
    fs.writeFileSync(
      path.join(tempDirPath, 'settings.json'),
      JSON.stringify(settingsJSON, undefined, 2)
    )

    // Create an example module
    fs.writeFileSync(
      path.join(
        tempDirPath,
        response.setupType === SetupType.multiple
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
  } catch (e) {
    console.error('An error occurred during project setup:', e)
    rimraf.sync(tempDirPath)
  }
}

async function init() {
  const response: Answers = (await prompts(questions)) as any
  createProject(response)
}

export default init
