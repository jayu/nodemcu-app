#!/usr/bin/env node

import { Command } from 'commander'

import createCommands from './commands'
import meta from './meta.json'
import { version } from './utils'

const program = new Command(meta.name)
program.description(meta.description)
program.version(version)
createCommands(program)
program.parse(process.argv)
