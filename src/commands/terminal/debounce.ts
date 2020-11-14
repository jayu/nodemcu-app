function debounce<Args extends Array<any>>(
  func: (...args: Args) => void,
  wait: number
) {
  let timeout: NodeJS.Timeout | undefined = undefined
  return function (...args: Args) {
    // @ts-ignore
    clearTimeout(timeout as number)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export default debounce
