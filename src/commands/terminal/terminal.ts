import readline from 'readline'
import serialport, { list } from 'serialport'
import ColorTerminal from './color-terminal'
import SanitizeUserInput from './sanitize-user-input'
import debounce from './debounce'
import { greenBright, bold } from 'colorette'

type Options = {
  baudRate: number
  port: string
}

function startTerminal({ port, baudRate }: Options) {
  const device = new serialport(port, {
    baudRate: baudRate,
    autoOpen: false
  })

  const sanitizeUserInput = new SanitizeUserInput()
  const colorTerminal = new ColorTerminal()

  device.pipe(sanitizeUserInput).pipe(colorTerminal).pipe(process.stdout)

  const userInput = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: bold(greenBright('> '))
  })

  const clearTerminal = () => {
    const blank = '\n'.repeat(process.stdout.rows)
    console.log(blank)
    readline.cursorTo(process.stdout, 0, 0)
    readline.clearScreenDown(process.stdout)
    userInput.prompt()
  }

  userInput.on('SIGINT', () => {
    process.exit(0)
  })

  userInput.on('line', (data) => {
    if (data === 'clear') {
      clearTerminal()
    } else if (data === 'exit') {
      process.exit(0)
    } else {
      const input = data + '\r\n'
      sanitizeUserInput.addInput(input)
      device.write(input)
    }
  })

  const showPromptDebounced = debounce(() => {
    userInput.prompt()
  }, 50)

  device.on('data', showPromptDebounced)

  device.open((error) => {
    if (error) {
      console.error(
        `Failed to open connection to port ${port} with baud rate ${baudRate}. Make sure port is owned by your os user`
      )
      process.exit(1)
    } else {
      clearTerminal()
    }
  })
}

async function init({ baudRate = 115200, port: _port }: Partial<Options>) {
  let port = _port
  if (port === undefined) {
    const ports = await list()
    if (ports.length > 0) {
      port = ports[0].path
      console.log(`No port provided. Using found port ${port}`)
    } else {
      console.error('No available ports found')
      process.exit(1)
    }
  }
  startTerminal({
    baudRate,
    port
  })
}

export default init
