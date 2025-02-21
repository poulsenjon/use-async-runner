/* eslint-disable @typescript-eslint/no-explicit-any */

export type Optional<T> = T | undefined

export type Nullable<T> = T | null

export type Maybe<T> = Optional<T> | Nullable<T>

export type AnyFunction = (...args: any) => any

export type AnyAsyncFunction = (...args: any) => Promise<any>
