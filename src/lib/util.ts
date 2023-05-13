export function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null
}

type Browser = "chrome" | "firefox"

export const detectBrowser: () => Browser = () => {
  if (typeof browser === "object") {
    return "firefox"
  }
  return "chrome"
}
