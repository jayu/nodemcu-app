export const projectNameDesc = {
  'project-name': 'Name of a project from entry directory (required for setup type multiple)'
}

type OptionMeta = [string, string]

export const portOption: OptionMeta = ['-p, --port <value>', 'serialport path eg. /dev/ttyUSB0']

export type PortOptionType = {
  port?: string
}

export const baudRateOption: OptionMeta = ['-br, --baudRate <value>', 'connection baud rate']

export type BaudRateOptionType = {
  baudRate?: string
}