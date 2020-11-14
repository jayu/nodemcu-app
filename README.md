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

- `-p ,--port <value>` - serialport path eg. /dev/ttyUSB0 (**required**)
- `-br ,--baudRate <value>` - connection baud rate (_optional_)

### Command `docs`

Generate documentation of available commands into md file.

#### Usage

```sh
nodemcu-app docs <outputPath> [options]
```

#### Arguments

- `outputPath` - path to output \*.md file (_optional_)

#### Options

- `-hl ,--headerLevel <value>` - Initial header level (_optional_)
<!-- cli-docs-end -->
