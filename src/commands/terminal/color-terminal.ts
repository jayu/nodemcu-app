import { Transform, TransformCallback } from 'stream'
import {
  greenBright,
  yellowBright,
  bold,
  magentaBright,
  cyanBright
} from 'colorette'

enum TokenType {
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  KEYWORD = 'KEYWORD',
  SPECIAL_CHAR = 'SPECIAL_CHAR',
  NON_NUMBER_VALUE = 'NON_NUMBER_VALUE'
}
type Token = {
  value: string
  type: TokenType
  whiteSpace: string
}

class Tokenizer {
  remainingInput = ''

  NUMBER = /^(0x){0,1}(([0-9a-f])|((\.){0,1}[0-9]))+$/
  NON_NUMBER_VALUE = /^(nil)|(true)|(false)$/
  KEYWORD = /^(function)|(do)|(end)|(float)|(integer)|(table)|(string)|(PANIC)$/
  SPECIAL_CHAR = /(=|\{|\}|\(|\)|\[|\]|:|;|,|-|_|\\|\/)/

  parse(_string: string): Token[] {
    let string = this.remainingInput
    string += _string
    const matches = (string.match(/(\S)+(\s)+/g) || []).reduce(
      (matches: string[], string: string) => {
        return [...matches, ...string.split(this.SPECIAL_CHAR)]
      },
      []
    )

    if (matches !== null) {
      const matchesLength = matches.reduce(
        (length: number, match: string) => length + match.length,
        0
      )
      this.remainingInput = string.substring(matchesLength)
      return matches.map((match) => {
        const whiteSpace = match.match(/(\s)+/g)
        const matchWithoutWhiteSpace = match.replace(/(\s)+/, '')
        let type = TokenType.STRING

        if (this.NUMBER.test(matchWithoutWhiteSpace)) {
          type = TokenType.NUMBER
        }

        if (this.KEYWORD.test(matchWithoutWhiteSpace)) {
          type = TokenType.KEYWORD
        }

        if (this.NON_NUMBER_VALUE.test(matchWithoutWhiteSpace)) {
          type = TokenType.NON_NUMBER_VALUE
        }

        if (this.SPECIAL_CHAR.test(matchWithoutWhiteSpace)) {
          type = TokenType.SPECIAL_CHAR
        }
        return {
          value: matchWithoutWhiteSpace,
          type,
          whiteSpace: whiteSpace !== null ? whiteSpace[0] : ''
        } as Token
      })
    }
    this.remainingInput = string
    return []
  }
}

class ColorTerminal extends Transform {
  tokenizer = new Tokenizer()
  colorTokens(tokens: Token[]) {
    return tokens.reduce((string, token) => {
      let colored = token.value
      switch (token.type) {
        case TokenType.NUMBER: {
          colored = yellowBright(token.value)
          break
        }
        case TokenType.KEYWORD: {
          colored = magentaBright(token.value)
          break
        }
        case TokenType.NON_NUMBER_VALUE: {
          colored = bold(greenBright(token.value))
          break
        }
        case TokenType.SPECIAL_CHAR: {
          colored = bold(cyanBright(token.value))
          break
        }
      }
      return string + colored + token.whiteSpace
    }, '')
  }
  _transform(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: TransformCallback
  ) {
    const string = chunk.toString()
    const tokens = this.tokenizer.parse(string)
    this.push(this.colorTokens(tokens))
    callback()
  }
}

export default ColorTerminal
