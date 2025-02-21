import { AnyAsyncFunction, Nullable } from '../types'

export enum AsyncRunnerAbortReason {
  /**
   * Запущено новое выполнение fn.
   * */
  NextRun = 'next-run',
  /**
   * Вызов функции abort.
   * */
  Manual = 'manual',
}

export interface AsyncRunnerResult<Fn extends AnyAsyncFunction> {
  /**
   * массив аргументов, с которыми было запущено выполнение fn.
   * */
  args: Parameters<Fn>
  /**
   * результат выполнения fn (null - в случае ошибки или прерывания выполнения fn).
   * */
  data: Nullable<Awaited<ReturnType<Fn>>>
  /**
   * ошибка выполнения fn (null - в случае успеха или прерывания выполнения fn).
   * */
  error: Nullable<Error>
  /**
   * причина прерывания выполнения fn (null - в случае успеха или ошибки).
   * */
  abortReason: Nullable<AsyncRunnerAbortReason>
}

export type AsyncRunnerFnProps<Fn extends AnyAsyncFunction> = {
  /**
   * Запускаемая асинхронная функция.
   * Выполнение fn может быть прервано по причинам, описанным перечислением AsyncRunnerAbortReason.
   * */
  fn: Fn
} & (Parameters<Fn>['length'] extends 0
  ? {
      /**
       * Разрешено не передавать, если fn не принимает аргументов.
       * */
      args?: Parameters<Fn>
    }
  : {
      /**
       * Массив аргументов, с которыми будет выполняться fn.
       * */
      args: Parameters<Fn>
    })

export type UseAsyncRunnerProps<Fn extends AnyAsyncFunction> = AsyncRunnerFnProps<Fn> & {
  /**
   * Флаг, разрешающий вызывать fn при изменении args.
   * Если не передан или false, то выполнение fn можно запустить только через вызов функций run или runWithArgs.
   * */
  autorun?: boolean
  /**
   * Таймаут в ms, при достижении которого выполнение fn будет остановлено с ошибкой.
   * Если не передан, то выполнение fn не будет ограничено по времени.
   * */
  timeout?: number
  /**
   * Функция, которая будет вызвана перед выполнением fn.
   * В неё будет передан 1 аргумент - массив аргументов, с которыми будет запущено выполнение fn.
   * */
  onStart?: (args: Parameters<Fn>) => void
  /**
   * Функция, которая будет вызвана при успешном выполнении fn.
   * В неё будет передано 2 аргумента - результат выполнения fn и массив аргументов, с которыми было запущено выполнение fn.
   * Эта функция не будет вызвана, при прерванном выполнении fn.
   * */
  onSuccess?: (data: Awaited<ReturnType<Fn>>, args: Parameters<Fn>) => void
  /**
   * Функция, которая будет вызвана при неудачном выполнении fn.
   * В неё будет передано 2 аргумента - ошибка выполнения fn и массив аргументов, с которыми было запущено выполнение fn.
   * Эта функция не будет вызвана, при прерванном выполнении fn.
   * */
  onError?: (err: Error, args: Parameters<Fn>) => void
  /**
   * Функция, которая будет вызвана при любом результате выполнения fn.
   * В неё будет передан 1 аргумент - массив аргументов, с которыми было запущено выполнение fn.
   * Эта функция не будет вызвана, при прерванном выполнении fn.
   * */
  onFinish?: (args: Parameters<Fn>) => void
  /**
   * Функция, которая будет вызвана при прерванном выполнении fn.
   * В неё будет передано 2 аргумента - причина прерывания выполнения fn и массив аргументов, с которыми было запущено выполнение fn.
   * */
  onAbort?: (abortReason: AsyncRunnerAbortReason, args: Parameters<Fn>) => void
}

export interface UseAsyncRunnerOutput<Fn extends AnyAsyncFunction> {
  /**
   * Состояние, показывающее, происходит выполнение fn или нет.
   * */
  isPending: boolean
  /**
   * Состояние, в котором хранится результат последнего выполнения fn.
   * */
  data: Nullable<Awaited<ReturnType<Fn>>>
  /**
   * Состояние, в котором хранится ошибка последнего выполнения fn.
   * */
  error: Nullable<Error>
  /**
   * Функция, запускающая выполнение fn с массивом аргументов args, переданных в хук.
   * Возвращает промис, который резолвит объект, описанный интерфейсом AsyncRunnerResult.
   * */
  run: () => Promise<AsyncRunnerResult<Fn>>
  /**
   * Функция, запускающая выполнение fn с аргументами, которые были переданы в неё.
   * Возвращает промис, который резолвит объект, описанный интерфейсом AsyncRunnerResult.
   * */
  runWithArgs: (...runnerArgs: Parameters<Fn>) => Promise<AsyncRunnerResult<Fn>>
  /**
   * Функция, принудительно прерывающая текущее выполнение fn.
   * */
  abort: () => void
}
