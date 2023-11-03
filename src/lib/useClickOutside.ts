import { useEffect, type RefObject } from "react"

export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: () => void
) => {
  useEffect(() => {
    let startedWhenMounted = false
    let startedInside = false
    const listener = (event: MouseEvent) => {
      if (startedInside || !startedWhenMounted) {
        return
      }
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler()
    }

    const validateEventStart = (event: MouseEvent) => {
      startedWhenMounted = ref.current !== null
      startedInside =
        ref.current !== null && ref.current.contains(event.target as Node)
    }

    document.addEventListener("mousedown", validateEventStart)
    document.addEventListener("click", listener)
    return () => {
      document.removeEventListener("mousedown", validateEventStart)
      document.removeEventListener("click", listener)
    }
  }, [ref, handler])
}
