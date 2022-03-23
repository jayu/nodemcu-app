import commander from 'commander'
import startTerminal from './terminal'

import {
  portOption,
  PortOptionType,
  baudRateOption,
  BaudRateOptionType
} from '../commonOptions'
import { findSerialPort } from '../commonFunctions'
import { defaultBaudRate } from '../../utils'

type Options = PortOptionType &
  BaudRateOptionType & {
    cmd?: string
    timeout?: string
  }

function create(program: commander.Command) {
  program
    .command('terminal')
    .description(
      'Run fully-featured terminal with output coloring and command history. Can be used standalone, do not require nodemcu-app project.'
    )
    .option(
      '-c, --cmd <string>',
      'Command to execute after starting the terminal'
    )
    .option(
      '-t, --timeout <number>',
      'Timeout after terminal should be closed in seconds'
    )
    .option(...portOption)
    .option(...baudRateOption)
    .action(async (options: Options) => {
      const baudRate =
        options.baudRate !== undefined
          ? parseInt(options.baudRate, 10)
          : defaultBaudRate
      const timeout =
        options.timeout !== undefined
          ? parseInt(options.timeout, 10)
          : undefined
      startTerminal({
        baudRate,
        port: options.port || (await findSerialPort()),
        timeout,
        command: options.cmd
      })
    })
}

export default create
