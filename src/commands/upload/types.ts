export type UploaderWrapperDataType = {
  port: string,
  baudRate: number,
  files: string[][],
}

export type UploaderWrapperFNType = (data: UploaderWrapperDataType) => string | null