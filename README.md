<h3 align="center">
  <code>nodemcu-app</code>
</h3>

<p align="center">
  A tool-chain for efficient NodeMCU (ESP8266, ESP32) apps development
</p>

---

<img alt="nodemcu-app version" src="https://img.shields.io/npm/v/nodemcu-app"> <img alt="nodemcu-app license" src="https://img.shields.io/npm/l/nodemcu-app"> <img alt="nodemcu-app PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square">

## About

This project is a CLI tool with bunch of commands that helps develop non-trivial NodeMCU applications. It makes it easy to reuse modules across different projects and automates the process of LFS (Lua File Store) compilation and upload for maximizing the amount of free the RAM available on ESP boards.

[Jump to CLI reference](#CLI-reference)

### Features

- 🖥️ Fully-featured **terminal** with output coloring and command history
- ✨ Application scaffolding generation that creates a settings file to glue everything up
- 🧩 Robust **module system** that allows to create custom reusable utilities
- 📦 **Bundler** that is able to merge many source files into one
- 🚢 **Uploader** that integrates already existing `nodemcu-uploader` or `nodemcu-tool` to bring all-in-one command for deploying your projects to the ESP
- ✈️ Possibility to update LFS image Over The Air from CLI
- 🖴 Ability to compile and upload **Lua byte code** or **LFS** image to save precious RAM. It's utilizing Lua cross compiler.
- 🇾 Multi environment support to have different settings per device or firmware build including the power of env variables.

#### Coming soon

- 📥 Installing Lua packages from Luarocks or NodeMCU Github repo
- 🕶️ watch mode for upload script to focus exclusively on coding
- 🎯 Support for Lua script native module resolution algorithm
- ☁️ Support for LFS compilation in the cloud to eliminated dependency on local compiler

### TypeScript for micro controllers

The ultimate goal of this project is to bring an ability to write NodeMCU applications with TypeScript by utilizing awesome [https://typescripttolua.github.io/docs/getting-started/](TypeScriptToLua) compiler. However this is still at a conceptual phase.

[Read about motivation and origin of the project](Motivation-and-origin-of-the-project)

## Getting started

### Installation

> If you are not familiar with JS environment, install [Node.js](https://nodejs.org) first

```
yarn global add nodemcu-app
```

or

```
npm -i -g nodemcu-app
```

### Prerequisites

The CLI can be used standalone, however to leverage it's all potential you will have to equip with additional tools.

To use `upload` script you will have to install [`nodemcu-uploader`](https://github.com/kmpm/nodemcu-uploader) or [`nodemcu-tool`](https://github.com/AndiDittrich/NodeMCU-Tool). The former is much faster.

To use **compilation** feature, you will need Lua cross compiler (`luac.cross`). You can read in NodeMCU docs on how to [build one](https://nodemcu.readthedocs.io/en/release/getting-started/#build-luaccross) for yourself. `nodemcu-app init` will ask for the path to `luac.cross`.

To use **LFS upload** feature you will have to, except having `luac.corss`, build NodeMCU firmware with a special settings for LFS support. You can build it using [NodeMCU custom builds](https://nodemcu-build.com/) or other methods. Once you flash LFS-ready firmware to ESP8266, just use `--lfs` flag for `upload` script, and the CLI will take care of everything! For more details about LFS [documentation](https://nodemcu.readthedocs.io/en/release/getting-started/#compile-lua-into-lfs-image) is a good reading. If you really need to know more, read this [whitepaper](https://nodemcu.readthedocs.io/en/release/lfs/) in docs.

### Creating `nodemcu-app` project

To start playing with other features than `terminal`, you will have to generate a project structure with a settings file.

To do so, run `nodemcu-app init` and you will be asked for several details. You can choose from two types of setup: `single` and `multiple`. Usually more useful is `multiple` setup with which you can re-use the same code across different projects. You might prefer to just have separate directory for each project, the `single` is for you.

> Prepare a path to `luac.cross` file in advance, if you plan to use [compilation or LFS](#Prerequisites)

The generates project structure looks like this:

```
my-nodemcu-project
├── luarocks_modules
├── modules
│   └── exampleModule.lua
├── projects
│   └── example-project
│       └── init.lua
└── settings.json
```

Where `settings.json` is a file that stores information about generated project. Editing this file is on you risk!

```json
{
  "setupType": "multiple",
  "manifestVersion": "1.1",
  "default": {
    "entryDir": "./projects",
    "moduleDirs": ["./modules", "./luarocks_modules"],
    "crossCompilerPath": "",
    "uploadToolBinary": "nodemcu-uploader"
  }
}
```

> In this example we decided to not use cross compilation feature. However you can update the path to cross compiler when you get ready.

### Using different environments

After creating a project using `nodemcu-app init`, you can add as many environments as you like, next to the `default` environment.

For example, you might need to use different `luac.cross` for different firmware versions. In order to do this, you can add another environment to settings file, eg. `beta-firmware`:

> Note that `luac.cross` might not work properly between different firmware versions, eg 2.0 and 3.0

```json
{
  "setupType": "multiple",
  "manifestVersion": "1.1",
  "default": {
    "entryDir": "./projects",
    "moduleDirs": ["./modules", "./luarocks_modules"],
    "crossCompilerPath": "./luac.cross",
    "uploadToolBinary": "nodemcu-uploader"
  },
  "beta-firmware": {
    "crossCompilerPath": "./beta-luac.cross"
  }
}
```

In order to use beta-firmware env, pass an `--env <value...>` flag to either `bundle` or `upload` script, eg.

```sh
nodemcu-app upload my-project --lfs --env beta-firmware
```

#### Environment variables

You can also specify env variables using `envVars` key in a given env setting, eg:

```json
{
  "setupType": "multiple",
  "manifestVersion": "1.1",
  "default": {
    "entryDir": "./projects",
    "moduleDirs": ["./modules", "./luarocks_modules"],
    "crossCompilerPath": "./luac.cross",
    "uploadToolBinary": "nodemcu-uploader",
    "envVars": {
      "IS_DEV": "true"
    }
  },
  "beta-firmware": {
    "crossCompilerPath": "./beta-luac.cross"
  },
  "prod": {
    "envVars": {
      "IS_DEV": "false"
    }
  }
}
```

You can refer to given env var in the code using `$` sign followed by the variable name inside a string.

> Note that using env vars is currently only supported inside strings.

eg:

```lua
local isDev = "$IS_DEV"
if (isDev) then
  startWithDelay()
else
  startWithoutDelay()
end
```

Env vars are interpolated during code bundling. You can not only use environment variables defined in `settings.json`, but also all variables defined in your OS will be available, eg:

```sh
SOME_VAR=VALUE nodemcu-app bundle/upload some-project
```

All variables from selected environments will be merge into one set, starting from your OS env vars and ending on the last provided environment.

#### Using multiple environments at the same time

You can use multiple environments at the same time. The environments will be merged into one, and the last you specified will eventually override values provided by the previous.

For given config file

```json
{
  "setupType": "multiple",
  "manifestVersion": "1.1",
  "default": {
    "entryDir": "./projects",
    "moduleDirs": ["./modules", "./luarocks_modules"],
    "crossCompilerPath": "./luac.cross",
    "uploadToolBinary": "nodemcu-uploader",
    "envVars": {
      "IS_DEV": "true",
      "SERVER_ADDR": "localhost:3000"
    }
  },
  "esp32": {
    "crossCompilerPath": "./esp32-luac.cross",
    "uploadToolBinary": "nodemcu-tool"
  },
  "remote-server": {
    "envVars": {
      "SERVER_ADDR": "example.com"
    }
  },
  "prod": {
    "envVars": {
      "IS_DEV": "false"
    }
  }
}
```

and specifying environments like `--env esp32 remote-server prod`

You will end up with the following settings:

```json
{
  "entryDir": "./projects",
  "moduleDirs": ["./modules", "./luarocks_modules"],
  "crossCompilerPath": "./esp32-luac.cross",
  "uploadToolBinary": "nodemcu-tool",
  "envVars": {
    "IS_DEV": "false",
    "SERVER_ADDR": "example.com"
  }
}
```

## CLI reference

<!-- cli-docs-start -->

### Command `terminal`

Run fully-featured terminal with output coloring and command history. Can be used standalone, do not require nodemcu-app project.

#### Usage

```sh
nodemcu-app terminal [options]
```

#### Options

- `-c, --cmd <string>` - Command to execute after starting the terminal (_optional_)
- `-t, --timeout <number>` - Timeout after terminal should be closed in seconds (_optional_)
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
- `-e, --env <values...>` - settings environment. "default" environment is always used. All selected environments are merged. Last provided environment is the most relevant. (_optional_)

### Command `upload`

Compile and upload a project to NodeMCU device using selected uploader

#### Usage

```sh
nodemcu-app upload [project-name] [options]
```

#### Arguments

- `project-name` - Name of a project from entry directory (required for setup type multiple) (_optional_)

#### Options

- `--noCompile` - Skip compilation process and upload raw .lua project bundle to NodeMCU. (_optional_)
- `--lfs` - Indicates if Lua File Store should be used. Note that your device has to be flashed with special firmware build to support LFS. (_optional_)
- `--lfsOta [url]` - Uploads LFS image to given url, typically an HTTP://{IP}:{PORT}, using POST request. Useful for update of LFS image after initial upload. Device has to run server that is capable of receiving binary file and reloading LFS image afterwards. Default url can be set in settings file as "otaUrl" (_optional_)
- `-p, --port <value>` - serialport path eg. /dev/ttyUSB0 (_optional_)
- `-br, --baudRate <value>` - connection baud rate (_optional_)
- `-e, --env <values...>` - settings environment. "default" environment is always used. All selected environments are merged. Last provided environment is the most relevant. (_optional_)

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

## Contributing

Project is open to contributions, just rise an issue if you see any area for enhancement or you noticed a bug.

## Development

Clone repo and install dependencies using `yarn`

To start development simply run build script in watch mode:

`yarn build:watch`

The environment is ready, now run following command to start the cli:

`yarn dev`

Don't forget to run tests

`yarn test:watch`

## Motivation and origin of the project

I come from JavaScript/TypeScript environment which is rich of ergonomic tooling that makes development really pleasant experience. This project is an attempt to bring some more ergonomics to NodeMCU ecosystem.

NodeMCU community is rather small and there is already a bunch of tools that supports development in different areas. I started with ESPlorer, but I was missing IDE DX like I have for web development. The thing I actually liked in ESPlorer was colored terminal. I tried coding Lua in VSCode and uploading my program manually using nodemcu-tool, and later using nodemcu-uploader, since it is faster.
However uploading several files to NodeMCU manually was cumbersome, and storing all code just in one source file was unacceptable.

I started working on a simple bundler that would be able to merge all source files into one init.lua, which will be easier to upload. I didn't know about existence of cross compilers then.

I was also missing an ergonomic terminal with some basic features like output coloring and commands history, so I attempt to implement one with Node's transform streams, readline module and serial port library.

Then I quickly bump onto a problem with really limited amount of RAM on ESP boards. Since I uploaded raw .lua files, board has to compile the code to byte code before execution, which turn out to be too greedy for the RAM and basically resulted with VM panic which was restarting the board.

I found out that it's possible to compile Lua code on on PC, before it gets uploaded. It required building Lua cross-compiler, but at the end I didn't have any other choice. I implemented a script that uses previously created bundler, compile a code using cross compiler and finally uploads it to the board, which just one CLI command. Using bundler along with compiler was actually redundant, but Lua module system was strange for me at that moment, and I preferred my bundler.

Uploading byte code helped only for a short term, since still the whole program has to be stored in RAM. Around 50kb is too less if you use many sensors which requires some additional libraries. I found out that there is one more thing that I can try to fit my code on NodeMCU. The mechanism called Lua Flash Store that allows to store whole program code in flash memory, so the whole RAM remains free and can be used for program execution. It required building and flashing NodeMCU firmware once again, but it was worth it. Since then, I was not limited by my program length.

However, uploading LFS image to NodeMCU is not as straightforward as it could be and requires reiterating on documentation and examples to actually make it work. It also requires 3-step upload process, that is unhandy to be done manually every time. So, as you may guess, I implemented a script...

With a set of several scripts, I realized that there might be more devs like me, that struggles with lack of convenient NodeMCU tool-chain. So I decided to refactor the whole thing and fit it into this CLI.

## Made with 🧠 by [@jayu](https://github.com/jayu)

I decided to spend some time on bringing all scripts that were serving me well during NodeMCU development into a CLI tool. I hope you will make a good use of it, and it's easy and intuitive. If not, just rise an issue. If this tool was useful, don't hesitate to give it a ⭐!
