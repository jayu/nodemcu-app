import fs from 'fs'
import commander from 'commander'

import { resolveSettingsFile, defaultBaudRate, FSNames } from '../../utils'
import { checkProjectName, getInitFilePath, determineDistDir, prepareDistDir, checkInitFileExists, findSerialPort, checkAndGetCompilerBinaryPath, checkUploader, getBundleFilePath, mergeEnvironments, checkManifestCompatibility } from '../commonFunctions';
import { portOption, PortOptionType, baudRateOption, BaudRateOptionType, envOption, EnvOptionType } from '../commonOptions'
import { UploadTool } from '../init/types'
import { uploadNoLFS, uploadLFS, uploadRawBundle } from './upload'
import bundle from '../bundle/bundle'
import compile from '../../compile'
import { UploaderWrapperDataType } from './types'
import nodemcuUploaderWrapper from './nodemcuUploaderWrapper'
import nodemcuToolWrapper from './nodemcuToolWrapper'


type Options = PortOptionType & BaudRateOptionType & EnvOptionType & { lfs: boolean, noCompile: boolean }

function create(program: commander.Command) {
  program
    .command('upload [project-name]')
    .description(
      'Compile and upload a project to NodeMCU device using selected uploader',
      {
        'project-name': 'Name of a project from entry directory (required for setup type multiple)'
      }
    )
    .option('--noCompile', 'Skip compilation process and upload raw .lua project bundle to NodeMCU.')
    .option('--lfs', 'Indicates if Lua File Store should be used. Note that your device has to be flashed with special firmware build to support LFS.')
    .option(...portOption)
    .option(...baudRateOption)
    .option(...envOption)
    .action(async (projectName: string | undefined, { port: _port, baudRate: _baudRate, lfs = false, noCompile = false, env = [] }: Options) => {
      const port = _port || await findSerialPort()
      const baudRate = _baudRate !== undefined ? parseInt(_baudRate, 10) : defaultBaudRate
      const cwd = process.cwd()
      const settingsFile = mergeEnvironments(resolveSettingsFile(cwd), env)
      const { moduleDirs, uploadToolBinary, envVars = {} } = settingsFile.default

      checkUploader(settingsFile)

      checkProjectName(projectName, cwd, settingsFile);
      checkManifestCompatibility(settingsFile)

      const initFilePath = getInitFilePath(projectName, settingsFile)

      checkInitFileExists(initFilePath)

      const distDirPath = determineDistDir(settingsFile, projectName)

      console.log('Cleaning dist folder...')
      prepareDistDir(distDirPath)

      const programCode = bundle(initFilePath, moduleDirs, envVars)
      console.log('Program bundled')

      const uploader = uploadToolBinary === UploadTool.nodemcuUploader ? nodemcuUploaderWrapper : nodemcuToolWrapper

      if (!noCompile) {
        const compilerBinaryPath = checkAndGetCompilerBinaryPath(settingsFile)
        const outputFiles = compile({ LFS: lfs, programCode, projectDistDir: distDirPath, compilerBinaryPath })
        console.log('Program compiled')
        const data: UploaderWrapperDataType = {
          baudRate,
          port,
          files: outputFiles,
          cwd
        }
        if (lfs) {
          await uploadLFS(uploader, data)
        }
        else {
          await uploadNoLFS(uploader, data)
        }
      }
      else {
        const distFilePath = getBundleFilePath(distDirPath)
        fs.writeFileSync(distFilePath, programCode)
        const data: UploaderWrapperDataType = {
          baudRate,
          port,
          files: [[distFilePath, FSNames.INIT]],
          cwd
        }
        await uploadRawBundle(uploader, data)
      }
    })
}

export default create
