import { arrayMove } from "@dnd-kit/sortable"
import { useCallback, useMemo, useRef, useState } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import { DEFAULT_COLOR, type Setting } from "./constantAndType"

const storage = new Storage()
const SETTINGS_KEY = "SETTINGS_KEY"
const COLOR_KEY = "COLOR_KEY"

export const readSettings = async (): Promise<Setting[]> => {
  const settings = await storage.get<Setting[] | undefined>(SETTINGS_KEY)
  return settings ?? []
}

export const readColor = async (): Promise<string> => {
  const color = await storage.get<string | undefined>(COLOR_KEY)
  return color ?? DEFAULT_COLOR
}

function generateUniqueId(): string {
  const timestamp = new Date().getTime()
  const randomNum = Math.random()
  const uniqueId = `${timestamp}-${randomNum}`

  return uniqueId
}

const newSetting: () => Setting = () => {
  return {
    id: generateUniqueId(),
    owner: "",
    repositoryName: "",
    baseBranch: "",
    compareBranch: "",
    strategy: "Merge"
  }
}

export function useSettings() {
  const {
    value: settings,
    setValue: setSettings,
    hasError
  } = useDebouncedStorage<Setting[]>(SETTINGS_KEY, (saved) => {
    if (saved === undefined) {
      return [newSetting()]
    }
    const filtered = saved.filter(
      (v) =>
        !(
          v.owner === "" &&
          v.repositoryName === "" &&
          v.baseBranch === "" &&
          v.compareBranch === ""
        )
    )
    if (filtered.length === 0) {
      return [newSetting()]
    }
    return filtered
  })

  const changeSetting = useCallback(
    (index: number, setting: Partial<Setting>) => {
      return setSettings((prev) => {
        const newSettings = [...prev]
        const s = newSettings[index]
        if (s === undefined) {
          return prev
        }
        newSettings[index] = { ...s, ...setting }
        return newSettings
      })
    },
    [setSettings]
  )

  const addSetting = useCallback(() => {
    return setSettings((prev) => {
      return [...prev, newSetting()]
    })
  }, [setSettings])

  const moveSettings = useCallback(
    (oldIndex: number, newIndex: number) => {
      return setSettings((prev) => {
        return arrayMove(prev, oldIndex, newIndex)
      })
    },
    [setSettings]
  )

  const removeSetting = useCallback(
    (index: number) => {
      return setSettings((prev) => {
        if (prev.length <= index) {
          return prev
        }
        return [...prev.slice(0, index), ...prev.slice(index + 1)]
      })
    },
    [setSettings]
  )

  return useMemo(() => {
    return {
      settings,
      changeSetting,
      addSetting,
      moveSettings,
      removeSetting,
      hasError
    }
  }, [
    settings,
    changeSetting,
    addSetting,
    moveSettings,
    removeSetting,
    hasError
  ])
}

export function useColor() {
  const {
    value: color,
    setValue: setColor,
    hasError
  } = useDebouncedStorage<string>(COLOR_KEY, (saved) => {
    if (saved === undefined) {
      return DEFAULT_COLOR
    }
    return saved
  })

  return useMemo(() => {
    return {
      color,
      setColor,
      hasError
    }
  }, [color, setColor, hasError])
}

// consistent with useStorage
type Setter<T> = ((v?: T, isHydrating?: boolean) => T) | T

// eslint-disable-next-line @typescript-eslint/ban-types
function isFunction(v: unknown): v is Function {
  return typeof v === "function"
}

function useDebouncedStorage<T>(
  key: string,
  onInit?: Setter<T>,
  timeoutMs?: number
) {
  const [hasError, setHasError] = useState(false)
  const [value, , { setRenderValue, setStoreValue }] = useStorage<T>(
    key,
    onInit
  )

  const errorHandledSetStoreValue = useCallback(
    (v?: T) => {
      setStoreValue(v).catch((e) => {
        console.error(e)
        setHasError(true)
      })
    },
    [setStoreValue]
  )

  const throttledSetStoreValue = useDebounce(
    errorHandledSetStoreValue,
    timeoutMs ?? 200
  )

  const setValue = useCallback(
    (v: T | ((prevState: T) => T)) => {
      setHasError(false)
      const newValue = isFunction(v) ? v(value) : v
      setRenderValue(newValue)
      throttledSetStoreValue(newValue)
      return newValue
    },
    [setRenderValue, throttledSetStoreValue, value]
  )

  return useMemo(() => {
    return {
      value,
      setValue,
      hasError
    }
  }, [value, setValue, hasError])
}

function useDebounce<T>(fn: (args?: T) => void, timeoutMs: number) {
  const timer = useRef<number | undefined>(undefined)
  const debounce = useCallback(
    (args?: T) => {
      if (timer.current) {
        window.clearTimeout(timer.current)
      }
      timer.current = window.setTimeout(() => {
        fn(args)
        timer.current = undefined
      }, timeoutMs)
    },
    [timeoutMs, fn]
  )
  return debounce
}
