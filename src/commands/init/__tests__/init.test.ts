import fs from 'fs';
import mock from 'mock-fs';
import { createProject } from '../init';
import { SetupType, UploadTool, YesOrLater, AnswerNames } from '../types'
const defaultProjectName = 'test-project';

const defaultAnswers = {
  [AnswerNames.projectDir]: defaultProjectName,
  [AnswerNames.setupType]: SetupType.multiple,
  [AnswerNames.projectsSubDir]: 'src',
  [AnswerNames.uploadTool]: UploadTool.nodemcuUploader,
  [AnswerNames.useCrossCompiler]: YesOrLater.decideLater,
  [AnswerNames.commonModulesDir]: 'modules',
  [AnswerNames.useLuaRocks]: false,
}

const getSettingsJSON = (projectName: string) => {
  return JSON.parse(fs.readFileSync(`${projectName}/settings.json`).toString())
}

const readDir = (dir: string) => fs.readdirSync(dir, { withFileTypes: true })

type Tree = Array<{ name: string, isDirectory: boolean, children: Tree | null }>

const getFilesTree = (root: string): Tree => {
  const dir = readDir(root);
  return dir.reduce<Tree>((tree, entry) => {
    return [
      ...tree,
      {
        name: entry.name,
        isDirectory: entry.isDirectory(),
        children: entry.isDirectory() ? getFilesTree(`${root}/${entry.name}`) : null
      }
    ]
  }, [])
}

beforeEach(() => {
  mock({
    '/': {}
  })
})

afterEach(() => {
  mock.restore()
})

it('Should create example project with setup type multiple', () => {
  createProject(defaultAnswers);
  const settings = getSettingsJSON(defaultProjectName)
  const filesTree = getFilesTree(defaultProjectName)
  mock.restore()
  expect(settings.setupType).toBe('multiple')
  expect(settings).toMatchSnapshot()
  expect(filesTree).toMatchSnapshot()
})

it('Should create example project with setup type single', () => {
  createProject({ ...defaultAnswers, [AnswerNames.setupType]: SetupType.single });
  const settings = getSettingsJSON(defaultProjectName)
  const filesTree = getFilesTree(defaultProjectName)
  mock.restore()
  expect(settings.setupType).toBe('single')
  expect(settings).toMatchSnapshot()
  expect(filesTree).toMatchSnapshot()
})

it('Should create example project with setup type multiple and custom dir names', () => {
  const projectName = 'my-project'
  createProject({
    ...defaultAnswers,
    [AnswerNames.projectDir]: 'my-project',
    [AnswerNames.projectsSubDir]: 'source-code',
    [AnswerNames.commonModulesDir]: 'custom-modules',
  });
  const settings = getSettingsJSON(projectName)
  const filesTree = getFilesTree(projectName)
  mock.restore()
  expect(settings).toMatchSnapshot()
  expect(filesTree).toMatchSnapshot()
})

it('Should create example project with cross compiler without copying it', () => {
  createProject({
    ...defaultAnswers,
    [AnswerNames.useCrossCompiler]: YesOrLater.yes,
    [AnswerNames.crossCompilerPath]: '/some-dir/luac.cross',
    [AnswerNames.copyLuaCross]: false,
  });
  const settings = getSettingsJSON(defaultProjectName)
  const filesTree = getFilesTree(defaultProjectName)
  mock.restore()
  expect(settings).toMatchSnapshot()
  expect(filesTree).toMatchSnapshot()
})

it('Should create example project with cross compiler with copying it', () => {

  mock({
    '/some-dir/my-luac.cross': 'fake-binary-content'
  })
  createProject({
    ...defaultAnswers,
    [AnswerNames.useCrossCompiler]: YesOrLater.yes,
    [AnswerNames.crossCompilerPath]: '/some-dir/my-luac.cross',
    [AnswerNames.copyLuaCross]: true,
  });
  const settings = getSettingsJSON(defaultProjectName)
  const filesTree = getFilesTree(defaultProjectName)
  mock.restore()
  expect(settings).toMatchSnapshot()
  expect(filesTree).toMatchSnapshot()
})

it('Should create example project with using of luarocks modules', () => {

  mock({
    '/some-dir/my-luac.cross': 'fake-binary-content'
  })
  createProject({
    ...defaultAnswers,
    [AnswerNames.useLuaRocks]: true,
    [AnswerNames.luaRocksModulesDir]: 'luarocks-modules-dir'
  });
  const settings = getSettingsJSON(defaultProjectName)
  const filesTree = getFilesTree(defaultProjectName)
  mock.restore()
  expect(settings).toMatchSnapshot()
  expect(filesTree).toMatchSnapshot()
})