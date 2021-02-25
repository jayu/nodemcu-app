import path from 'path'
import fs from 'fs'
import cp from 'child_process'
import dedent from 'dedent'

import { exitWithError } from '../utils'
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
  const bundleFileName = 'bundle.lua'
  const bundleFilePath = path.join(projectDistDir, bundleFileName)
  fs.writeFileSync(bundleFilePath, programCode)

  const distFileName = 'init.lc'
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
  const distInitLuaPath = path.join(projectDistDir, 'init.lua')
  fs.writeFileSync(distInitLuaPath, dedent`
      require('init')
    `)

  return [[distFilePath, distFileName], [distInitLuaPath, 'init.lua']]
}

const compileToLFS = ({ compilerBinaryPath, programCode, projectDistDir }: Omit<Args, 'LFS'>): string[][] => {
  const bundleFileName = 'bundle.lua'
  const bundleFilePath = path.join(projectDistDir, bundleFileName)
  fs.writeFileSync(bundleFilePath, programCode)

  const LFSLoaderDistFilePath = path.join(projectDistDir, '_init.lua')
  fs.writeFileSync(LFSLoaderDistFilePath, LFSLoaderContent)

  const distFileName = 'lfs.img'
  const distFilePath = path.join(projectDistDir, distFileName)
  try {
    cp.execSync(`${compilerBinaryPath} -o ${distFilePath} -f ${LFSLoaderDistFilePath} ${bundleFilePath}`, {
      stdio: [null, null, null],
    })
  }
  catch (e) {
    const actualErrorMsg = e.stderr.toString()
    throwCompilationError(actualErrorMsg)
    return []
  }
  const distInitLuaPath = path.join(projectDistDir, 'init.lua')
  fs.writeFileSync(distInitLuaPath, dedent`
    node.flashindex("_init")()
    LFS.bundle()
  `)
  const distFlashReloadPath = path.join(projectDistDir, 'flash_reload.lua')
  fs.writeFileSync(distFlashReloadPath, dedent`
    node.flashreload("${distFileName}")
  `)
  return [[distFilePath, distFileName], [distInitLuaPath, 'init.lua'], [distFlashReloadPath, 'flash_reload.lua']]
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