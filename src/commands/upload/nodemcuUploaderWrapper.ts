import cp from 'child_process'
import { UploaderWrapperDataType } from './types';

const uploadFiles = ({ baudRate, port, files }: UploaderWrapperDataType): string | null => {
  const filesList = files.map((pair) => pair.join(':')).join(' ')
  console.log('Uploader output:')
  try {
    cp.execSync(`nodemcu-uploader --port ${port} --baud ${baudRate} upload ${filesList} `)
  }
  catch (e) {
    return e.stderr.toString()
  }
  return null
}

export default uploadFiles