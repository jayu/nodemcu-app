import commander from 'commander'
import init from './init'

function create(program: commander.Command) {
  program
    .command('init')
    .description(
      'Run interactive wizard that will create nodemcu-app project structure.'
    )
    .action(async () => {
      await init()
    })
}

export default create
