import commander from 'commander'
import startTerminal from './terminal'

import { portOption, PortOptionType, baudRateOption, BaudRateOptionType } from '../commonOptions'

type Options = PortOptionType & BaudRateOptionType

function create(program: commander.Command) {
  program
    .command('terminal')
    .description(
      'Run fully-featured terminal with output coloring and command history. Can be used standalone, do not require nodemcu-app project.'
    )
    .option(...portOption)
    .option(...baudRateOption)
    .action((options: Options) => {
      const baudRate =
        options.baudRate !== undefined ? parseInt(options.baudRate) : undefined
      startTerminal({
        baudRate,
        port: options.port
      })
    })
}

export default create
