import { Transform, TransformCallback } from 'stream'

class SanitizeUserInput extends Transform {
  buffer: string[]

  constructor() {
    super()
    this.buffer = []
  }
  addInput(string: string) {
    this.buffer.push(string)
  }
  filterNodeMCUPrompt(string: string) {
    return string.replace(/>(\s)*/, '')
  }
  filter(string: string) {
    let res = this.filterNodeMCUPrompt(string)
    const leftoverBuffer = []
    for (const input of this.buffer) {
      if (res.includes(input)) {
        res = res.replace(input, '')
      } else {
        leftoverBuffer.push(input)
      }
    }
    this.buffer = leftoverBuffer
    return res
  }
  _transform(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: TransformCallback
  ) {
    const string = this.filter(chunk.toString())
    this.push(string)
    callback()
  }
}

export default SanitizeUserInput
