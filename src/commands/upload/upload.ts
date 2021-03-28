import cp from 'child_process'
import { UploaderWrapperFNType, UploaderWrapperDataType } from './types'
import { exitWithError, FSNames } from '../../utils'

const handleUploadResult = (error: string | null) => {
  if (error !== null) {
    exitWithError('Upload was unsuccessfull', 'Uploader error:', error)
  }
  else {
    console.log('Upload finnished succesfully')
    console.log('Run `nodemcu-app terminal -c "node.restart()"` to test your deployment')
  }
}

export const uploadRawBundle = (uploader: UploaderWrapperFNType, data: UploaderWrapperDataType) => {
  console.log('Uploading raw lua code bundle...')
  const result = uploader(data);
  handleUploadResult(result)
}

export const uploadNoLFS = (uploader: UploaderWrapperFNType, data: UploaderWrapperDataType) => {
  console.log('Uploading compiled byte code...')
  const result = uploader(data);
  handleUploadResult(result)
}

export const uploadLFS = (uploader: UploaderWrapperFNType, data: UploaderWrapperDataType) => {
  console.log('Uploading compiled LFS image...')
  const result = uploader(data);
  handleUploadResult(result)
  try {
    const nodemcuAppBinaryPath = require.main?.filename
    console.log('Rebooting...')
    cp.execSync(`node ${nodemcuAppBinaryPath} terminal -c "node.restart()" -t 2 -p ${data.port} -br ${data.baudRate}`, { stdio: 'inherit' })
    console.log('Reloading LFS image...')
    cp.execSync(`node ${nodemcuAppBinaryPath} terminal -c "node.LFS.reload('${FSNames.LFS_IMG}')" -t 5 -p ${data.port} -br ${data.baudRate}`, { stdio: 'inherit' })
    console.log('LFS upload process seems to be successfull')
  }
  catch (e) {
    console.log('Failed to reload LFS image on device')
    console.log('Actual error:', e.message)
  }
}