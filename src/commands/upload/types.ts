export type UploaderWrapperDataType = {
  files: string[][],
  cwd: string
  port: string,
  baudRate: number,
} 

export type UploaderWrapperFNType = (data: UploaderWrapperDataType) => Promise<string | null>