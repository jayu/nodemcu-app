import cp from 'child_process'
import { UploaderWrapperDataType } from './types';

const uploadFiles = async ({ baudRate, port, files }: UploaderWrapperDataType): Promise<string | null> => {
  const filesList = files.map(([fsPath]) => fsPath)
  return new Promise((resolve) => {
    const errors: string[] = []
    /**
     * It's not possible to pipe nodemcu-tool progress bar and at the same time hook into stderr to capture upload errors
     * Progress bar is visible only when cp stdio is inherited, but then we cannot read stderr to see if upload was successful or not
     */
    const upload = cp.spawn(`nodemcu-tool`, ['--port', port, '--baud', baudRate.toString(), 'upload', ...filesList])
    upload.stderr.pipe(process.stderr)
    upload.stdout.pipe(process.stdout);

    upload.stderr.on('data', (data) => {
      errors.push(data.toString())
    });

    upload.on('close', (code) => {
      // Filter out some warning that actually is not an uploading error
      const filteredErrors = errors.filter((error) => !error.includes('padLevels'))
      resolve(filteredErrors.length > 0 || code !== 0 ? filteredErrors.join(' ') || 'Unknown error' : null)
    });
  })
}

export default uploadFiles