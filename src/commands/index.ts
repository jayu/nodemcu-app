import commander from 'commander'

import createTerminal from './terminal'
import createDocs from './docs'
import createInit from './init'

export default function createAll(program: commander.Command) {
  createTerminal(program)
  createInit(program)
  createDocs(program)
}
