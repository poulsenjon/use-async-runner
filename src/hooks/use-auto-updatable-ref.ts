import { RefObject, useRef } from 'react'

export function useAutoUpdatableRef<T>(value: T): RefObject<T> {
  const ref = useRef(value)
  ref.current = value
  return ref
}
