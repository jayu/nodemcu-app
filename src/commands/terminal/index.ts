import commander from 'commander'
import startTerminal from './terminal'

type Options = {
  port?: string
  baudRate?: string
}

function create(program: commander.Command) {
  program
    .command('terminal')
    .description(
      'Run fully-featured terminal with output coloring and command history.'
    )
    .requiredOption('-p, --port <value>', 'serialport path eg. /dev/ttyUSB0')
    .option('-br, --baudRate <value>', 'connection baud rate')
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
