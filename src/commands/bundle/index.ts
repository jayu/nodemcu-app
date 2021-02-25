import commander from 'commander'
import fs from 'fs'

import { bundle } from './bundle'
import { resolveSettingsFile } from '../../utils'
import { checkProjectName, getInitFilePath, determineDistDir, getBundleFilePath, prepareDistDir, checkInitFileExists } from '../common';

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
      const { moduleDirs } = settingsFile.default

      checkProjectName(projectName, cwd, settingsFile);

      const initFilePath = getInitFilePath(projectName, settingsFile)

      checkInitFileExists(initFilePath)

      let distFilePath;
      if (dest !== undefined) {
        distFilePath = dest
      }
      else {
        const distDirPath = determineDistDir(settingsFile, projectName)
        distFilePath = getBundleFilePath(distDirPath)

        console.log('Cleaning dist folder...')
        prepareDistDir(distDirPath)
      }

      const code = bundle(initFilePath, moduleDirs)
      fs.writeFileSync(distFilePath, code)

      console.log(`Bundle generated successfully: ${distFilePath} !`)
    })
}

export default create
