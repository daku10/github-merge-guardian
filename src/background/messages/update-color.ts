import { sendToContentScript, type PlasmoMessaging } from "@plasmohq/messaging"

import { DEFAULT_COLOR } from "~lib/constantAndType"
import { UPDATE_COLOR } from "~lib/message"

const queryUrl = "https://github.com/*/pull/*"

const handler: PlasmoMessaging.MessageHandler<{ color: string }> = async (
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
              name: UPDATE_COLOR,
              tabId: tab.id,
              body: {
                color: req.body?.color ?? DEFAULT_COLOR
              }
            })
          )
      )
        .catch((e: unknown) => {
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
