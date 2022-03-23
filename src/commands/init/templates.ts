import dedent from 'dedent'

export const exampleModule = dedent`
local function increment(value)
  return value + 1
end

local function decrement(value)
  return value - 1
end

return {
  increment = increment, 
  decrement = decrement
}

`
export const exampleModuleName = 'exampleModule'

export const exampleInitFile = dedent`
local exampleModule = require('${exampleModuleName}')

print('Welcome in example nodemcu-app project')

local counter = 0
print('Counter value: ' .. counter)
counter = exampleModule.increment(counter)
print('Counter value incremented by example module: ' .. counter)

`

export const gitignore = dedent`
dist
`
