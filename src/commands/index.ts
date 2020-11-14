import commander from 'commander'

import createTerminal from './terminal'
import createDocs from './docs'

export default function createAll(program: commander.Command) {
  createTerminal(program)
  createDocs(program)
}
