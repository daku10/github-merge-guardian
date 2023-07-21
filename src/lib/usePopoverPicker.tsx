import { useCallback, useMemo, useRef, useState } from "react"
import { HexColorPicker } from "react-colorful"

import { useClickOutside } from "./useClickOutside"

type Props = {
  color: string
  onChange: (color: string) => void
  displayClassName?: string
  pickerClassName?: string
}

export const usePopoverPicker = ({
  color,
  onChange,
  displayClassName,
  pickerClassName
}: Props) => {
  const popover = useRef<HTMLDivElement>(null)
  const [isOpen, toggle] = useState(false)

  const close = useCallback(() => {
    toggle(false)
  }, [])
  useClickOutside(popover, close)

  const renderDisplay = useMemo(() => {
    return (
      <button
        className={displayClassName}
        style={{ backgroundColor: color }}
        onClick={() => {
          toggle(true)
        }}
      />
    )
  }, [color, displayClassName])

  const renderPicker = useMemo(() => {
    return isOpen ? (
      <div className={pickerClassName} ref={popover}>
        <HexColorPicker color={color} onChange={onChange} />
      </div>
    ) : null
  }, [isOpen, color, onChange, pickerClassName])

  return { renderDisplay, renderPicker }
}
