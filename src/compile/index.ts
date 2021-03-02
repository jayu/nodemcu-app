import path from 'path'
import fs from 'fs'
import cp from 'child_process'
import dedent from 'dedent'

import { exitWithError, FSNames, noExt } from '../utils'
import LFSLoaderContent from './LFS-loader';

type Args = {
  compilerBinaryPath: string,
  programCode: string,
  projectDistDir: string,
  LFS: boolean
}

const throwCompilationError = (error: string) => {
  exitWithError('', error, '☝ Lua cross compilation error! ☝', '')
}

const compileToBytecode = ({ compilerBinaryPath, programCode, projectDistDir }: Omit<Args, 'LFS'>): string[][] => {
  const bundleFileName = FSNames.BUNDLE
  const bundleFilePath = path.join(projectDistDir, bundleFileName)
  fs.writeFileSync(bundleFilePath, programCode)

  const distFileName = FSNames.INIT_BYTE_CODE
  const distFilePath = path.join(projectDistDir, distFileName)

  try {
    cp.execSync(`${compilerBinaryPath} -o ${distFilePath} ${bundleFilePath}`, {
      stdio: [null, null, null],
    })
  }
  catch (e) {
    const actualErrorMsg = e.stderr.toString()
    throwCompilationError(actualErrorMsg)
    return []
  }
  const distInitLuaPath = path.join(projectDistDir, FSNames.INIT)
  fs.writeFileSync(distInitLuaPath, dedent`
      require('${noExt(FSNames.INIT_BYTE_CODE)}')
    `)

  return [[distFilePath, distFileName], [distInitLuaPath, FSNames.INIT]]
}

const compileToLFS = ({ compilerBinaryPath, programCode, projectDistDir }: Omit<Args, 'LFS'>): string[][] => {
  const bundleFileName = FSNames.BUNDLE
  const bundleFilePath = path.join(projectDistDir, bundleFileName)
  fs.writeFileSync(bundleFilePath, programCode)

  const LFSLoaderDistFilePath = path.join(projectDistDir, FSNames.LFS_LOADER_INIT)
  fs.writeFileSync(LFSLoaderDistFilePath, LFSLoaderContent)

  const LFSFileName = FSNames.LFS_IMG
  const LFSFilePath = path.join(projectDistDir, LFSFileName)
  try {
    cp.execSync(`${compilerBinaryPath} -o ${LFSFilePath} -f ${LFSLoaderDistFilePath} ${bundleFilePath}`, {
      stdio: [null, null, null],
    })
  }
  catch (e) {
    const actualErrorMsg = e.stderr.toString()
    throwCompilationError(actualErrorMsg)
    return []
  }
  const distInitLuaPath = path.join(projectDistDir, FSNames.INIT)
  fs.writeFileSync(distInitLuaPath, dedent`
    node.flashindex("${noExt(FSNames.LFS_LOADER_INIT)}")()
    LFS.${noExt(FSNames.BUNDLE)}()
  `)

  return [[LFSFilePath, LFSFileName], [distInitLuaPath, FSNames.INIT]]
}

/**
 * Dist folder has to exist and has to be empty
 */
export default function compile({ LFS, ...rest }: Args): string[][] {
  try {
    if (LFS) {
      return compileToLFS(rest)
    }
    return compileToBytecode(rest)
  }
  catch (e) {
    exitWithError('⚠️ Unexpected compilation error: ⚠️', '', e.message)
  }
  return []
}