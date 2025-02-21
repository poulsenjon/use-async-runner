import { useCallback, useState } from 'react'

export function useBooleanState(
  initialValue: boolean | (() => boolean),
): [bool: boolean, setTrue: () => void, setFalse: () => void] {
  const [bool, setBool] = useState(initialValue)

  const setTrue = useCallback(() => setBool(true), [])
  const setFalse = useCallback(() => setBool(false), [])

  return [bool, setTrue, setFalse] as const
}
