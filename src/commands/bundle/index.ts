import commander from 'commander'
import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'

import { bundle } from './bundle'
import { resolveSettingsFile, getProjectsList, exitWithError } from '../../utils'
import { SetupType } from '../init/types'

type Options = {
  dest?: string
}

function create(program: commander.Command) {
  program
    .command('bundle [project-name]')
    .description(
      'Bundle a project and it\'s dependencies into one destination file',
      {
        'project-name': 'Name of a project from entry directory (required for setup type multiple)'
      }
    )
    .option('-d, --dest [value]', 'destination file path; defaults to \'dist/bundle.lua\'')
    .action((projectName: string | undefined, { dest }: Options) => {
      const cwd = process.cwd()
      const settingsFile = resolveSettingsFile(cwd)
      const { entryDir, moduleDirs } = settingsFile.default
      const isMultipleSetup = settingsFile.setupType === SetupType.multiple;

      const projectsList = isMultipleSetup ? getProjectsList(cwd, entryDir) : null
      if (isMultipleSetup && projectName === undefined && projectsList !== null) {
        exitWithError('[project-name] is required for setup type multiple.', `Avaliable projects are: ${projectsList.join(', ')}`)
      }

      if (projectsList !== null && projectName !== undefined && !projectsList.includes(projectName)) {
        exitWithError(`Selected project '${projectName}' does not exist in ${entryDir}.`, `Avaliable projects are: ${projectsList.join(', ')}`)
      }

      const initFilePath = path.join(entryDir, projectName !== undefined ? projectName : '', 'init.lua')

      let distFilePath;
      if (dest !== undefined) {
        distFilePath = dest
      }
      else {
        const distDirPath = isMultipleSetup && projectName !== undefined ? path.join(entryDir, projectName, 'dist') : './dist'
        distFilePath = path.join(distDirPath, 'bundle.lua')

        console.log('Cleaning dist folder...')

        rimraf.sync(distDirPath)
        fs.mkdirSync(distDirPath)
      }

      if (!fs.existsSync(initFilePath)) {
        exitWithError(`${initFilePath} does not exist.`)
      }

      const code = bundle(initFilePath, moduleDirs)

      fs.writeFileSync(distFilePath, code)

      console.log(`Bundle generated successfully: ${distFilePath} !`)
    })
}

export default create
