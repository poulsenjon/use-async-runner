import deepEqual from 'fast-deep-equal'
import { useCallback, useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { MAX_INT32 } from '../constants'
import { AnyAsyncFunction, AnyFunction, Nullable } from '../types'
import { withTimeout } from '../utils/with-timeout'
import {
  AsyncRunnerAbortReason,
  AsyncRunnerResult,
  UseAsyncRunnerOutput,
  UseAsyncRunnerProps,
} from './use-async-runner.types'
import { useAutoUpdatableRef } from './use-auto-updatable-ref'
import { useBooleanState } from './use-boolean-state'

interface AsyncRunner<Fn extends AnyAsyncFunction> {
  id: string
  args: Parameters<Fn>
  start: () => void
  success: (data: Awaited<ReturnType<Fn>>) => void
  error: (err: Error) => void
  finish: () => void
  abort: (abortReason: AsyncRunnerAbortReason) => void
  run: () => void
}

export function useAsyncRunner<Fn extends AnyAsyncFunction>({
  fn,
  args = [] as unknown as Parameters<Fn>,
  autorun = false,
  timeout = MAX_INT32,
  onStart,
  onSuccess,
  onError,
  onFinish,
  onAbort,
}: UseAsyncRunnerProps<Fn>): UseAsyncRunnerOutput<Fn> {
  const [isPending, startPending, finishPending] = useBooleanState(autorun)
  const [data, setData] = useState<Nullable<Awaited<ReturnType<Fn>>>>(null)
  const [error, setError] = useState<Nullable<Error>>(null)

  const runnerRef = useRef<Nullable<AsyncRunner<Fn>>>(null)
  const argsRef = useRef(args)

  const fnRef = useAutoUpdatableRef(fn)
  const autorunRef = useAutoUpdatableRef(autorun)
  const timeoutRef = useAutoUpdatableRef(timeout)
  const onStartRef = useAutoUpdatableRef(onStart)
  const onSuccessRef = useAutoUpdatableRef(onSuccess)
  const onErrorRef = useAutoUpdatableRef(onError)
  const onFinishRef = useAutoUpdatableRef(onFinish)
  const onAbortRef = useAutoUpdatableRef(onAbort)

  const isCurrentRunner = useCallback((runnerId: string) => {
    return runnerRef.current?.id === runnerId
  }, [])

  const createCurrentRunnerResultHandler = useCallback(
    (runnerId: string) => {
      return <C extends AnyFunction>(callback: C) => {
        return (...resultArgs: Parameters<C>) => {
          return isCurrentRunner(runnerId) && callback(...resultArgs)
        }
      }
    },
    [isCurrentRunner],
  )

  const createRunner = useCallback(
    (runnerArgs: Parameters<Fn>): Promise<AsyncRunnerResult<Fn>> => {
      return new Promise((resolve) => {
        const runnerId = uuid()
        const runnerResult: AsyncRunnerResult<Fn> = { args: runnerArgs, data: null, error: null, abortReason: null }
        const currentRunnerResultHandler = createCurrentRunnerResultHandler(runnerId)

        const runner: AsyncRunner<Fn> = {
          id: runnerId,
          args: runnerArgs,
          start: () => {
            startPending()
            setError(null)
            setData(null)
            onStartRef.current?.(runnerArgs)
          },
          success: currentRunnerResultHandler((runnerData) => {
            runnerResult.data = runnerData
            setData(runnerData)
            onSuccessRef.current?.(runnerData, runnerArgs)
          }),
          error: currentRunnerResultHandler((runnerError) => {
            console.error(runnerError)
            const error = runnerError instanceof Error ? runnerError : new Error(JSON.stringify(runnerError))
            runnerResult.error = error
            setError(error)
            onErrorRef.current?.(error, runnerArgs)
          }),
          finish: currentRunnerResultHandler(() => {
            onFinishRef.current?.(runnerArgs)
            resolve(runnerResult)
            runnerRef.current = null
            finishPending()
          }),
          abort: (runnerAbortReason: AsyncRunnerAbortReason) => {
            runnerResult.abortReason = runnerAbortReason
            onAbortRef.current?.(runnerAbortReason, runnerArgs)
            resolve(runnerResult)
            runnerRef.current = null
            finishPending()
          },
          run: () =>
            queueMicrotask(() => {
              runner.start()
              withTimeout(() => fnRef.current(...runnerArgs), timeoutRef.current)
                .then(runner.success)
                .catch(runner.error)
                .finally(runner.finish)
            }),
        }

        runnerRef?.current?.abort(AsyncRunnerAbortReason.NextRun)
        runnerRef.current = runner

        runner.run()
      })
    },
    [
      createCurrentRunnerResultHandler,
      finishPending,
      fnRef,
      onAbortRef,
      onErrorRef,
      onFinishRef,
      onStartRef,
      onSuccessRef,
      startPending,
      timeoutRef,
    ],
  )

  const run = useCallback(() => {
    return createRunner(argsRef.current)
  }, [createRunner])

  const runWithArgs = useCallback(
    (...runnerArgs: Parameters<Fn>) => {
      return createRunner(runnerArgs)
    },
    [createRunner],
  )

  const abort = useCallback(() => {
    runnerRef.current?.abort(AsyncRunnerAbortReason.Manual)
  }, [])

  useEffect(() => {
    if (!deepEqual(argsRef.current, args)) {
      argsRef.current = args
      autorunRef.current && run()
    }
  }, [args, autorunRef, run])

  useEffect(() => {
    autorunRef.current && run()
  }, [autorunRef, run])

  return {
    isPending,
    data,
    error,
    run,
    runWithArgs,
    abort,
  }
}
