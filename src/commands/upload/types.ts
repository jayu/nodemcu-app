export type UploaderWrapperDataType = {
  port: string,
  baudRate: number,
  files: string[][],
  cwd: string
}

export type UploaderWrapperFNType = (data: UploaderWrapperDataType) => Promise<string | null>