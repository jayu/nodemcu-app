export enum AnswerNames {
  setupType = 'setupType',
  projectDir = 'projectDir',
  projectsSubDir = 'projectsSubDir',
  uploadTool = 'uploadTool',
  useCrossCompiler = 'useCrossCompiler',
  crossCompilerPath = 'crossCompilerPath',
  copyLuaCross = 'copyLuaCross',
  commonModulesDir = 'commonModulesDir',
  useLuaRocks = 'useLuaRocks',
  luaRocksModulesDir = 'luaRocksModulesDir'
}

export enum SetupType {
  single = 'single',
  multiple = 'multiple'
}

export enum UploadTool {
  nodemcuUploader = 'nodemcu-uploader',
  nodemcuTool = 'nodemcu-tool',
  decideLater = ''
}

export enum YesOrLater {
  yes = 'yes',
  decideLater = 'decideLater'
}

export type Answers = {
  [AnswerNames.projectDir]: string
  [AnswerNames.setupType]: SetupType
  [AnswerNames.projectsSubDir]?: string
  [AnswerNames.uploadTool]: UploadTool
  [AnswerNames.useCrossCompiler]: YesOrLater
  [AnswerNames.crossCompilerPath]?: string
  [AnswerNames.copyLuaCross]?: boolean
  [AnswerNames.commonModulesDir]?: string
  [AnswerNames.useLuaRocks]: YesOrLater
  [AnswerNames.luaRocksModulesDir]?: string
}

export type EnvVars = {
  [key: string]: string | undefined
}

export type SettingsSet = {
  entryDir: string
  moduleDirs: string[]
  crossCompilerPath?: string
  uploadToolBinary: UploadTool
  envVars?: EnvVars
  otaUrl?: string
}

export type SettingsFile = {
  setupType: SetupType
  manifestVersion: '1.0' | '1.1'
  default: SettingsSet
  [key: string]: SettingsSet | string | SetupType
}
