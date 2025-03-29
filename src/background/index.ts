import { sendToContentScript } from "@plasmohq/messaging"

import { UPDATE_PAGE } from "~lib/message"

// this is only for pull request page(not including commits, files, etc.)
const regex =
  /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+(?:\?[^#]*)?(?:#.*)?$/

// eslint-disable-next-line @typescript-eslint/no-deprecated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.match(regex)) {
    sendToContentScript({ tabId, name: UPDATE_PAGE }).catch((e: unknown) => {
      console.error(e)
    })
  }
})
