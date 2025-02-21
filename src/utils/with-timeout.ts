import { MAX_INT32 } from '../constants'
import { delay } from './delay'

export function withTimeout<T>(callback: () => Promise<T>, timeout: number): Promise<T> {
  const timer = Math.min(timeout, MAX_INT32)
  const callbackPromise = callback()
  const timeoutPromise = delay(timer).then(() => Promise.reject(new Error(`Rejected by timeout ${timer} ms`)))
  return Promise.race([callbackPromise, timeoutPromise])
}
