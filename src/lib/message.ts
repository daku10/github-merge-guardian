import type { Setting } from "./constantAndType"
import { parseSetting } from "./setting"
import { isObject } from "./util"

export const UPDATE_PAGE = "update-page"
export const QUERY_MATCHED_SETTING = "query-matched-setting"
// This is linked to the message type in src/background/messages/update-settings.ts
export const UPDATE_SETTINGS = "update-settings"
// This is linked to the message type in src/background/messages/update-color.ts
export const UPDATE_COLOR = "update-color"

type UpdatePage = {
  name: typeof UPDATE_PAGE
}

type UpdateSettings = {
  name: typeof UPDATE_SETTINGS
  body: {
    settings: Setting[]
  }
}

type QueryMatchedSetting = {
  name: typeof QUERY_MATCHED_SETTING
}

type UpdateColor = {
  name: typeof UPDATE_COLOR
  body: {
    color: string
  }
}

export type Message =
  | UpdatePage
  | UpdateSettings
  | QueryMatchedSetting
  | UpdateColor

export const parseMessage: (message: unknown) => Message | null = (message) => {
  if (!isObject(message)) {
    return null
  }
  if (typeof message["name"] !== "string") {
    return null
  }
  if (message["name"] === UPDATE_PAGE) {
    return {
      name: UPDATE_PAGE
    }
  }
  if (message["name"] === UPDATE_SETTINGS) {
    if (!isObject(message["body"])) {
      return null
    }
    const body = message["body"]
    if (!Array.isArray(body["settings"])) {
      return null
    }
    const settings = body["settings"]
    const parsed = settings
      .map(parseSetting)
      .filter((s): s is Setting => s !== null)

    return {
      name: UPDATE_SETTINGS,
      body: {
        settings: parsed
      }
    }
  }
  if (message["name"] === QUERY_MATCHED_SETTING) {
    return {
      name: QUERY_MATCHED_SETTING
    }
  }
  if (message["name"] === UPDATE_COLOR) {
    if (!isObject(message["body"])) {
      return null
    }
    const body = message["body"]
    if (typeof body["color"] !== "string") {
      return null
    }
    return {
      name: UPDATE_COLOR,
      body: {
        color: body["color"]
      }
    }
  }
  return null
}
