import { type PlasmoMessaging, sendToContentScript } from "@plasmohq/messaging"

import type { Setting } from "~lib/constantAndType"
import { UPDATE_SETTINGS } from "~lib/message"

const queryUrl = "https://github.com/*/pull/*"

const handler: PlasmoMessaging.MessageHandler<{ settings: Setting[] }> = async (
  req,
  res
) => {
  return new Promise<void>((resolve) => {
    // NOTE: chrome.tabs.query has Promise API, but it doesn't work well on firefox.
    // e.g. const tabs = await chrome.tabs.query({ url: queryUrl })..., tabs is undefined on firefox.
    chrome.tabs.query({ url: queryUrl }, (tabs) => {
      Promise.all(
        tabs
          .filter(
            (tab): tab is chrome.tabs.Tab & { id: number } =>
              tab.id !== undefined
          )
          .map((tab) =>
            sendToContentScript({
              name: UPDATE_SETTINGS,
              tabId: tab.id,
              body: {
                settings: req.body?.settings ?? []
              }
            })
          )
      )
        .catch((e) => {
          console.error(e)
        })
        .finally(() => {
          res.send({})
          resolve()
        })
    })
  })
}

export default handler
