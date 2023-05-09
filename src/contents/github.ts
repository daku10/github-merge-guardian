import type { PlasmoCSConfig } from "plasmo"

import { STRATEGIES, type Setting } from "~lib/constantAndType"
import {
  QUERY_MATCHED_SETTING,
  UPDATE_COLOR,
  UPDATE_PAGE,
  UPDATE_SETTINGS,
  parseMessage
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
    .catch((e) => {
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
      selectStrategyExecButtonElement(s)?.classList.remove(styles.execButton)
    })
    changeMenuButtonColorReset()
    return
  }
  const strategy = setting.strategy

  abortController = new AbortController()

  STRATEGIES.forEach((s) => {
    const selectElement = selectStrategySelectButtonElement(s)
    const execElement = selectStrategyExecButtonElement(s)
    if (s === strategy) {
      selectElement?.classList.remove(styles.selectButton)
      selectElement?.addEventListener(
        "click",
        changeMenuButtonColorReset,
        abortController ? { signal: abortController.signal } : undefined
      )
      execElement?.classList.remove(styles.execButton)
    } else {
      selectElement?.classList.add(styles.selectButton)
      selectElement?.addEventListener(
        "click",
        changeMenuButtonColorWarning,
        abortController ? { signal: abortController.signal } : undefined
      )
      execElement?.classList.add(styles.execButton)
    }
  })

  strategy === retrieveSelectedStrategy()
    ? changeMenuButtonColorReset()
    : changeMenuButtonColorWarning()
}

const changeMenuButtonColorWarning = () => {
  selectMenuButtonElement()?.classList.add(styles.menuButton)
}

const changeMenuButtonColorReset = () => {
  selectMenuButtonElement()?.classList.remove(styles.menuButton)
}

const main = () => {
  new MutationObserver((_, observer) => {
    const actions = selectRootActionsElement()
    if (actions) {
      observer.disconnect()
      if (selectMenuButtonElement()) {
        readAndApplySetting()
      }
      new MutationObserver((_, actionsObserver) => {
        if (selectMenuButtonElement()) {
          actionsObserver.disconnect()
          readAndApplySetting()
        }
      }).observe(actions, { childList: true, subtree: true })
    }
  }).observe(document.body, { childList: true, subtree: true })
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
  .catch((e) => {
    console.error(e)
  })

chrome.runtime.onMessage.addListener(
  (rawMessage: unknown, _sender, sendResponse) => {
    const message = parseMessage(rawMessage)
    if (message === null) {
      return
    }
    if (message.name === UPDATE_PAGE) {
      main()
      return
    }
    if (message.name === UPDATE_SETTINGS) {
      applySetting(message.body.settings)
      sendResponse({})
      // To make this function asynchronous, return true
      return true
    }
    if (message.name === QUERY_MATCHED_SETTING) {
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
          .catch((e) => {
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
    if (message.name === UPDATE_COLOR) {
      changeColor(message.body.color)
      sendResponse({})
      return
    }
    return
  }
)
