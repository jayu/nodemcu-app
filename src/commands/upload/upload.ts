import cp from 'child_process'
import fs from 'fs'
import path from 'path'
import { UploaderWrapperFNType, UploaderWrapperDataType } from './types'
import { exitWithError, FSNames } from '../../utils'
import fetch from 'node-fetch'
const handleUploadResult = (error: string | null, ota = false) => {
  if (error !== null) {
    exitWithError('Upload was unsuccessful', 'Uploader error:', error)
  } else {
    console.log('Upload finished successfully')
    if (ota) {
      console.log("Don't forget to reload LFS image on device")
    } else {
      console.log(
        'Run `nodemcu-app terminal -c "node.restart()"` to test your deployment'
      )
    }
  }
}

export const uploadRawBundle = async (
  uploader: UploaderWrapperFNType,
  data: UploaderWrapperDataType
) => {
  console.log('Uploading raw lua code bundle...')
  const result = await uploader(data)
  handleUploadResult(result)
}

export const uploadNoLFS = async (
  uploader: UploaderWrapperFNType,
  data: UploaderWrapperDataType
) => {
  console.log('Uploading compiled byte code...')
  const result = await uploader(data)
  handleUploadResult(result)
}

export const uploadLFS = async (
  uploader: UploaderWrapperFNType,
  data: UploaderWrapperDataType
) => {
  console.log('Uploading compiled LFS image...')
  const result = await uploader(data)
  handleUploadResult(result)
  try {
    const nodemcuAppBinaryPath = require.main?.filename
    console.log('Rebooting...')
    cp.execSync(
      `node ${nodemcuAppBinaryPath} terminal -c "node.restart()" -t 2 -p ${data.port} -br ${data.baudRate}`,
      { stdio: 'inherit' }
    )
    console.log('Reloading LFS image...')
    cp.execSync(
      `node ${nodemcuAppBinaryPath} terminal -c "node.LFS.reload('${FSNames.LFS_IMG}')" -t 5 -p ${data.port} -br ${data.baudRate}`,
      { stdio: 'inherit' }
    )
    console.log('LFS upload process seems to be successful')
  } catch (e) {
    console.log('Failed to reload LFS image on device')
    console.log('Actual error:', e.message)
  }
}

export const uploadLFSOTA = async ({
  otaUrl,
  lfsFilePath,
  cwd
}: {
  lfsFilePath: string
  otaUrl: string
  cwd: string
}) => {
  const fileContent = fs.readFileSync(path.join(cwd, lfsFilePath))
  const fileSize = fileContent.length.toString()
  console.log(
    `Uploading compiled LFS image (${fileSize} bytes) to ${otaUrl}...`
  )

  try {
    const response = await fetch(otaUrl, {
      method: 'POST',
      body: fileContent,
      headers: {
        'Content-Type': 'application/octet-stream',
        'content-length': fileSize
      }
    })
    const possibleStatusError =
      response.status !== 200
        ? `Upload failed with status ${
            response.status
          }, response: ${await response.text()}`
        : null
    handleUploadResult(possibleStatusError, true)
  } catch (e: any) {
    handleUploadResult(e.message, true)
  }
}
