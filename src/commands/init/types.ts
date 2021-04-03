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

export type SettingsSet = {
  entryDir: string,
  moduleDirs: string[],
  crossCompilerPath?: string,
  uploadToolBinary: UploadTool
}

export type SettingsFile = {
  setupType: SetupType,
  manifestVersion: string,
  default: SettingsSet,
  // Those two are not supported yet
  esp32?: SettingsSet
  esp8266?: SettingsSet
}