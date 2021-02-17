import { PromptObject } from 'prompts'
import fs from 'fs'
import { getAbsolutePath } from '../../utils'

import {AnswerNames, SetupType, Answers, YesOrLater, UploadTool } from './types';

const nonEmptyValidator = (value: string) => {
  return value.trim().length > 0 ? true : 'Value cannot be empty.'
}

const questions = [
  {
    type: 'select',
    name: AnswerNames.setupType,
    message: 'Select setup type',
    choices: [
      {
        title: 'Multiple',
        description:
          'Create a directory to develop multiple projects with shared modules (recommended)',
        value: SetupType.multiple
      },
      {
        title: 'Single',
        description: 'Create single project directory without shared modules',
        value: SetupType.single
      }
    ],
    initial: 0
  },
  {
    type: 'text',
    name: AnswerNames.projectDir,
    message: (setupType: SetupType) =>
      setupType === SetupType.multiple
        ? `Please provide a name for a directory`
        : 'Please provide project name',
    initial: 'my-nodemcu-app',
    validate: nonEmptyValidator
  },
  {
    type: (_prev: string, answers: Pick<Answers, AnswerNames.setupType>) =>
      answers[AnswerNames.setupType] === SetupType.multiple ? 'text' : null,
    name: AnswerNames.projectsSubDir,
    message: 'Please provide a name of a subdirectory for projects',
    initial: 'projects',
    validate: nonEmptyValidator
  },
  {
    type: (_prev: string, answers: Pick<Answers, AnswerNames.setupType>) =>
      answers[AnswerNames.setupType] === SetupType.multiple ? 'text' : null,
    name: AnswerNames.commonModulesDir,
    message: 'Please provide a name for a directory to store common modules',
    initial: 'modules',
    validate: nonEmptyValidator
  },
  {
    type: 'select',
    name: AnswerNames.useLuaRocks,
    message: 'Would you like to use LuaRocks (Lua package manager) modules?',
    choices: [
      {
        title: 'yes',
        description: 'The `luarocks` binary must be available in system PATH',
        value: YesOrLater.yes
      },
      {
        title: 'I will decide later',
        description:
          'You can set proper value in generated setup file at any time',
        value: YesOrLater.decideLater
      }
    ],
    initial: 0
  },
  {
    type: (prev: YesOrLater) => (prev === YesOrLater.yes ? 'text' : null),
    name: AnswerNames.luaRocksModulesDir,
    message: 'Please provide a name for a directory to store LuaRocks modules',
    initial: 'luarocks_modules',
    validate: nonEmptyValidator
  },
  {
    type: 'select',
    name: AnswerNames.uploadTool,
    message:
      'Select a tool for uploading code on nodeMCU (tool binary must be in system PATH)',
    choices: [
      {
        title: 'nodemcu-uploader',
        description:
          'Home page: https://github.com/kmpm/nodemcu-uploader. Requires Python. Fastest upload.',
        value: UploadTool.nodemcuUploader
      },
      {
        title: 'I wll decide later',
        description: 'You can tool name in generated setup file at any time',
        value: UploadTool.decideLater
      },
      {
        title: 'nodemcu-tool (integration available soon)',
        description:
          'Home page: https://github.com/AndiDittrich/NodeMCU-Tool. Requires JS. Quite slow upload.',
        value: UploadTool.nodemcuTool,
        disabled: true
      }
    ],
    initial: 0
  },
  {
    type: 'select',
    name: AnswerNames.useCrossCompiler,
    message: 'Would you like to use compiler or LFS (Lua File Store) features?',
    choices: [
      {
        title: 'yes',
        description:
          'You will need to build luac.cross file on your system (https://nodemcu.readthedocs.io/en/dev/getting-started/#build-luaccross)',
        value: YesOrLater.yes
      },
      {
        title: 'I will decide later',
        description:
          'You can set proper value in generated setup file at any time',
        value: YesOrLater.decideLater
      }
    ],
    initial: 0
  },
  {
    type: (prev: YesOrLater) => (prev === YesOrLater.yes ? 'text' : null),
    name: AnswerNames.crossCompilerPath,
    message: 'Provide path to luac.cross binary file.',
    format: (value: string) => {
      return getAbsolutePath(value)
    },
    validate: (value: string) => {
      return fs.existsSync(getAbsolutePath(value))
        ? true
        : 'Path do not exist! Please try again.'
    }
    // initial: './luac.cross', // default value is buggy when user provide incorrect input
  },
  {
    type: (
      _prev: string,
      answers: Pick<Answers, AnswerNames.useCrossCompiler>
    ) =>
      answers[AnswerNames.useCrossCompiler] === YesOrLater.yes
        ? 'confirm'
        : null,
    name: AnswerNames.copyLuaCross,
    message:
      'Would you like to copy luac.cross into project directory (recommended)?',
    initial: true
  }
]


export default questions as PromptObject[]
