import { useCallback, useEffect, useMemo, useState } from "react"
import { match } from "ts-pattern"

import "./style.css"

import {
  DEFAULT_COLOR,
  type Setting,
  type Strategy
} from "~lib/constantAndType"
import { QUERY_MATCHED_SETTING, UPDATE_COLOR } from "~lib/message"
import { parseSetting } from "~lib/setting"
import { useColor } from "~lib/storage"
import { usePopoverPicker } from "~lib/usePopoverPicker"
import { detectBrowser, isObject } from "~lib/util"

// this can be matched pull request commits, checks and files page.
const regex = /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/

function useCurrentUrlAndSetting() {
  const [currentUrl, setCurrentUrl] = useState<string>("")
  const [matchedSetting, setMatchedSetting] = useState<Setting | null>(null)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0]
      setCurrentUrl(activeTab?.url ?? "")
      if (activeTab?.id !== undefined && activeTab.url?.match(regex) !== null) {
        chrome.tabs.sendMessage(
          activeTab.id,
          { name: QUERY_MATCHED_SETTING },
          (response: unknown) => {
            if (isObject(response)) {
              setMatchedSetting(parseSetting(response))
            } else {
              setMatchedSetting(null)
            }
          }
        )
      }
    })
  }, [])

  return useMemo(() => {
    return { currentUrl, matchedSetting }
  }, [currentUrl, matchedSetting])
}

const OptionButton = ({ className }: { className?: string }) => {
  const openOptionPage = useCallback(() => {
    chrome.runtime.openOptionsPage()
  }, [])
  return (
    <button
      className={`text-gh hover:text-blue-400 ${className ?? ""}`}
      onClick={openOptionPage}>
      <svg
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    </button>
  )
}

function IndexPopup() {
  const { currentUrl, matchedSetting } = useCurrentUrlAndSetting()
  const { color, setColor } = useColor()
  const updateColor = useCallback(
    (color: string) => {
      setColor(color)
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0]
        if (
          activeTab?.id !== undefined &&
          activeTab.url?.match(regex) !== null
        ) {
          chrome.tabs.sendMessage(
            activeTab.id,
            {
              name: UPDATE_COLOR,
              body: {
                color
              }
            },
            () => {
              // do nothing
            }
          )
        }
      })
    },
    [setColor]
  )

  if (!currentUrl.match(regex)) {
    return (
      <div className="p-4 w-72 flex items-center justify-between">
        <p className="text-sm font-bold text-gh">
          This is not a GitHub PR page
        </p>
        <OptionButton />
      </div>
    )
  }

  if (matchedSetting === null) {
    return (
      <div className="p-4 w-60 flex items-center justify-between">
        <p className="text-sm font-bold text-gh">There is no matching rule</p>
        <OptionButton />
      </div>
    )
  }

  return (
    <div className="p-4 w-[640px]">
      <p className="text-sm font-bold text-gh">Current matching rule</p>
      <div className="grid grid-cols-5 mt-2 gap-1 mx-auto">
        <span className="text-xs">Owner</span>
        <span className="text-xs">Repository</span>
        <span className="text-xs">Base branch</span>
        <span className="text-xs">Compare branch</span>
        <span className="text-xs">Merge strategy</span>
        <span className="font-semibold">{matchedSetting.owner}</span>
        <span className="font-semibold">{matchedSetting.repositoryName}</span>
        <span className="font-semibold">{matchedSetting.baseBranch}</span>
        <span className="font-semibold">{matchedSetting.compareBranch}</span>
        <span className="font-semibold">
          {convertLabel(matchedSetting.strategy)}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-sm font-bold text-gh">Color</p>
        <div className="flex gap-4">
          <ColorPickerFooter
            color={color}
            onChange={updateColor}
            onChangeDefault={() => {
              updateColor(DEFAULT_COLOR)
            }}
          />
        </div>
      </div>
    </div>
  )
}

type ColorPickerFooterProps = {
  color: string
  onChange: (color: string) => void
  onChangeDefault: () => void
}

const ColorPickerFooter = ({
  color,
  onChange,
  onChangeDefault
}: ColorPickerFooterProps) => {
  const { renderDisplay, renderPicker } = usePopoverPicker({
    color,
    onChange,
    displayClassName: "w-8 h-6 rounded-lg border border-ghgrayBorder",
    pickerClassName: "mt-4"
  })

  const isFirefox = detectBrowser() === "firefox"

  return (
    <div>
      <div className="flex gap-4">
        {isFirefox ? (
          renderDisplay
        ) : (
          <input
            type="color"
            value={color}
            onChange={(e) => {
              onChange(e.currentTarget.value)
            }}
          />
        )}
        <button
          className="text-xs rounded-lg border border-ghgrayBorder text-gh bg-ghgray hover:bg-ghgrayHover px-2 py-1"
          onClick={onChangeDefault}>
          Reset to Defaults
        </button>
        <OptionButton className="ml-auto" />
      </div>
      {isFirefox && renderPicker}
    </div>
  )
}

const convertLabel = (strategy: Strategy): string => {
  return match(strategy)
    .with("Merge", () => "Create a merge commit")
    .with("Squash", () => "Squash and merge")
    .with("Rebase", () => "Rebase and merge")
    .exhaustive()
}

export default IndexPopup
