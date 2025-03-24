import type { PlasmoCSConfig } from "plasmo"

import { STRATEGIES, type Setting } from "~lib/constantAndType"
import {
  parseMessage,
  QUERY_MATCHED_SETTING,
  UPDATE_COLOR,
  UPDATE_PAGE,
  UPDATE_SETTINGS
} from "~lib/message"
import {
  retrieveRepositorySlug,
  retrieveSelectedStrategy,
  selectBaseBranchText,
  selectCompareBranchText,
  selectMenuButtonElement,
  selectRootActionsElement,
  selectStrategyExecButtonElement,
  selectStrategySelectButtonElement
} from "~lib/selector"
import { getMatchedSetting } from "~lib/setting"
import { readColor, readSettings } from "~lib/storage"

import styles from "./style.module.css"

export const config: PlasmoCSConfig = {
  matches: ["https://github.com/*"]
}

let abortController: AbortController | undefined = undefined

const readAndApplySetting = () => {
  readSettings()
    .then((settings) => {
      applySetting(settings)
    })
    .catch((e: unknown) => {
      console.error(e)
    })
}

const applySetting = (settings: Setting[]) => {
  const [owner, repositoryName] = retrieveRepositorySlug()
  const baseBranch = selectBaseBranchText()
  const compareBranch = selectCompareBranchText()

  // TODO: error handling
  if (
    owner === null ||
    repositoryName === null ||
    baseBranch === null ||
    compareBranch === null
  ) {
    return
  }

  const setting = getMatchedSetting(
    owner,
    repositoryName,
    baseBranch,
    compareBranch,
    settings
  )

  abortController?.abort()

  // TODO: need to refactor
  if (setting === null) {
    STRATEGIES.forEach((s) => {
      selectStrategySelectButtonElement(s)?.classList.remove(
        styles.selectButton
      )
    })
    changeButtonsColorReset()
    return
  }
  const strategy = setting.strategy

  abortController = new AbortController()

  selectMenuButtonElement()?.addEventListener(
    "click",
    () => {
      // Strategy select button is not rendered immediately, so wait a little
      setTimeout(() => {
        STRATEGIES.forEach((s) => {
          const selectElement = selectStrategySelectButtonElement(s)
          if (s === strategy) {
            selectElement?.classList.remove(styles.selectButton)
            selectElement?.addEventListener(
              "click",
              changeButtonsColorReset,
              abortController ? { signal: abortController.signal } : undefined
            )
          } else {
            selectElement?.classList.add(styles.selectButton)
            selectElement?.addEventListener(
              "click",
              changeButtonsColorWarning,
              abortController ? { signal: abortController.signal } : undefined
            )
          }
        })
      }, 10)
    },
    { signal: abortController.signal }
  )

  if (strategy === retrieveSelectedStrategy()) {
    changeButtonsColorReset()
  } else {
    changeButtonsColorWarning()
  }
}

const changeButtonsColorReset = () => {
  selectMenuButtonElement()?.classList.remove(styles.menuButton)
  selectStrategyExecButtonElement()?.classList.remove(styles.execButton)
}

const changeButtonsColorWarning = () => {
  selectMenuButtonElement()?.classList.add(styles.menuButton)
  selectStrategyExecButtonElement()?.classList.add(styles.execButton)
}

const actionObserver = new MutationObserver((_, observer) => {
  if (selectMenuButtonElement()) {
    observer.disconnect()
    readAndApplySetting()
  }
})

const bodyObserver = new MutationObserver((_, observer) => {
  const actions = selectRootActionsElement()
  if (actions) {
    observer.disconnect()
    const menu = selectMenuButtonElement()
    if (menu) {
      readAndApplySetting()
    } else {
      actionObserver.observe(actions, { childList: true, subtree: true })
    }
  }
})

const main = () => {
  bodyObserver.observe(document.body, { childList: true, subtree: true })
}

const changeColor = (color: string) => {
  const root = document.documentElement
  root.style.setProperty("--gmg-exec-button-color", color)
  root.style.setProperty("--gmg-select-button-color", color)
  root.style.setProperty("--gmg-menu-button-color", color)
}

readColor()
  .then((color) => {
    changeColor(color)
  })
  .catch((e: unknown) => {
    console.error(e)
  })

chrome.runtime.onMessage.addListener(
  (rawMessage: unknown, _sender, sendResponse) => {
    const message = parseMessage(rawMessage)
    if (message === null) {
      return
    }
    switch (message.name) {
      case UPDATE_PAGE: {
        main()
        return
      }
      case UPDATE_SETTINGS: {
        applySetting(message.body.settings)
        return
      }
      case QUERY_MATCHED_SETTING: {
        const [owner, repositoryName] = retrieveRepositorySlug()
        const baseBranch = selectBaseBranchText()
        const compareBranch = selectCompareBranchText()
        if (owner && repositoryName && baseBranch && compareBranch) {
          readSettings()
            .then((settings) => {
              const setting = getMatchedSetting(
                owner,
                repositoryName,
                baseBranch,
                compareBranch,
                settings
              )
              sendResponse(setting)
            })
            .catch((e: unknown) => {
              console.error(e)
              sendResponse({})
            })
          // To make this function asynchronous, return true
          return true
        } else {
          sendResponse({})
          return
        }
      }
      case UPDATE_COLOR: {
        changeColor(message.body.color)
        sendResponse({})
        return
      }
      default: {
        const _: never = message
      }
    }
    return
  }
)
