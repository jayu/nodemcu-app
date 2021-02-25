# `nodemcu-app`

🚧 Project under construction. More coming soon! 🚧

## CLI reference

<!-- cli-docs-start -->

### Command `terminal`

Run fully-featured terminal with output coloring and command history. Can be used standalone, do not require nodemcu-app project.

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

### Command `bundle`

Bundle a project and it's dependencies into one destination file

#### Usage

```sh
nodemcu-app bundle [project-name] [options]
```

#### Arguments

- `project-name` - Name of a project from entry directory (required for setup type multiple) (_optional_)

#### Options

- `-d, --dest [value]` - destination file path; defaults to 'dist/bundle.lua' (_optional_)

### Command `docs`

Generate documentation of available commands into md file.

#### Usage

```sh
nodemcu-app docs <outputPath> [options]
```

#### Arguments

- `outputPath` - path to output \*.md file (**required**)

#### Options

- `-hl, --headerLevel <value>` - Initial header level (_optional_)
<!-- cli-docs-end -->

## Development

Clone repo and install dependencies using `yarn`

To start development simply run build script in watch mode:

`yarn build:watch`

The environment is ready, now run following command to start the cli:

`yarn dev`
