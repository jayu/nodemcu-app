import commander from 'commander'
import fs from 'fs'

import bundle from './bundle'
import { resolveSettingsFile } from '../../utils'
import {
  checkProjectName,
  getInitFilePath,
  determineDistDir,
  getBundleFilePath,
  prepareDistDir,
  checkInitFileExists,
  mergeEnvironments,
  checkManifestCompatibility
} from '../commonFunctions'
import { projectNameDesc, envOption, EnvOptionType } from '../commonOptions'

type Options = EnvOptionType & {
  dest?: string
}

function create(program: commander.Command) {
  program
    .command('bundle [project-name]')
    .description(
      "Bundle a project and it's dependencies into one destination file",
      projectNameDesc
    )
    .option(
      '-d, --dest [value]',
      "destination file path; defaults to 'dist/bundle.lua'"
    )
    .option(...envOption)
    .action((projectName: string | undefined, { dest, env = [] }: Options) => {
      const cwd = process.cwd()
      const settingsFile = mergeEnvironments(resolveSettingsFile(cwd), env)

      const { moduleDirs, envVars = {} } = settingsFile.default

      checkProjectName(projectName, cwd, settingsFile)
      checkManifestCompatibility(settingsFile)

      const initFilePath = getInitFilePath(projectName, settingsFile)

      checkInitFileExists(initFilePath)

      let distFilePath
      if (dest !== undefined) {
        distFilePath = dest
      } else {
        const distDirPath = determineDistDir(settingsFile, projectName)
        distFilePath = getBundleFilePath(distDirPath)

        console.log('Cleaning dist folder...')
        prepareDistDir(distDirPath)
      }

      const code = bundle(initFilePath, moduleDirs, envVars)
      fs.writeFileSync(distFilePath, code)

      console.log(`Bundle generated successfully: ${distFilePath} !`)
    })
}

export default create
