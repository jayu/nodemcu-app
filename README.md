# `nodemcu-app`

🚧 Project under construction. More coming soon! 🚧

## CLI reference

<!-- cli-docs-start -->

### Command `terminal`

Run fully-featured terminal with output coloring and command history.

#### Usage

```sh
nodemcu-app terminal [options]
```

#### Options

- `-p, --port <value>` - serialport path eg. /dev/ttyUSB0 (_optional_)
- `-br, --baudRate <value>` - connection baud rate (_optional_)

### Command `init`

Run interactive wizard that will create nodemcu-app project structure.

#### Usage

```sh
nodemcu-app init
```

### Command `docs`

Generate documentation of available commands into md file.

#### Usage

```sh
nodemcu-app docs <outputPath> [options]
```

#### Arguments

- `outputPath` - path to output \*.md file (_optional_)

#### Options

- `-hl, --headerLevel <value>` - Initial header level (_optional_)
<!-- cli-docs-end -->

## Development

Clone repo and install dependencies using `yarn`

To start development simply run build script in watch mode:

`yarn build:watch`

The environment is ready, now run following command to start the cli:

`yarn dev`
