import { Command } from 'commander'

import createCommands from './commands'
import meta from './meta.json'

const program = new Command(meta.name)
program.description(meta.description)

createCommands(program)
program.parse(process.argv)
