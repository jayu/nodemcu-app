import commander from 'commander'

import createTerminal from './terminal'
import createDocs from './docs'
import createInit from './init'
import createBundle from './bundle'
import createUpload from './upload'

export default function createAll(program: commander.Command) {
  createTerminal(program)
  createInit(program)
  createBundle(program)
  createUpload(program)
  createDocs(program)
}
