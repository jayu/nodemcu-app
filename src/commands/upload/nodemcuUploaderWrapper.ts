import cp from 'child_process'
import { UploaderWrapperDataType } from './types'

const uploadFiles = async ({
  baudRate,
  port,
  files
}: UploaderWrapperDataType): Promise<string | null> => {
  const filesList = files.map((pair) => pair.join(':'))
  try {
    for (const fileNamesPair of filesList) {
      /**
       * nodemcu-uploader prints everything to stderr...
       * Even if it support uploading multiple files at once, it do not always work. Uploading separatelly is more stable.
       */
      console.log(fileNamesPair)
      const { stderr } = cp.spawnSync(`nodemcu-uploader`, [
        '--port',
        port,
        '--baud',
        baudRate.toString(),
        'upload',
        fileNamesPair
      ])
      if (!stderr.toString().includes('All done!')) {
        return stderr.toString()
      }
    }
  } catch (e) {
    return e.stderr.toString()
  }
  return null
}

export default uploadFiles
