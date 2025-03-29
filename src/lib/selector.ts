import { match } from "ts-pattern"

import type { Strategy } from "./constantAndType"

// this can be matched pull request commits, checks and files page.
const regex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/\d+/

export const retrieveRepositorySlug: () => [
  string | null,
  string | null
] = () => {
  const match = regex.exec(window.location.href)
  if (match === null) {
    return [null, null]
  }
  const [, owner, repositoryName] = match
  if (owner === undefined || repositoryName === undefined) {
    return [null, null]
  }
  return [owner, repositoryName]
}

export const selectRootActionsElement = () => {
  return document.querySelector<HTMLElement>(".discussion-timeline-actions")
}

export const selectBaseBranchText: () => string | null = () => {
  return document.querySelector(".base-ref")?.textContent ?? null
}

export const selectCompareBranchText: () => string | null = () => {
  return document.querySelector(".head-ref")?.textContent ?? null
}

export const selectMenuButtonElement = () => {
  return document.querySelector<HTMLButtonElement>(
    '[aria-label="Select merge method"]'
  )
}

export const selectStrategySelectButtonElement = (strategy: Strategy) => {
  // select from aria-keyshortcuts attribute, but it's fragile to change the value.
  const value = match(strategy)
    .with("Merge", () => "c")
    .with("Squash", () => "s")
    .with("Rebase", () => "r")
    .exhaustive()
  return document.querySelector<HTMLElement>(`li[aria-keyshortcuts="${value}"]`)
}

export const selectStrategyExecButtonElement = () => {
  // TODO: it's fragile to change the class name.
  return document.querySelector<HTMLButtonElement>(
    "[class^=prc-Button-ButtonBase-].flex-1"
  )
}

export const retrieveSelectedStrategy: () => Strategy | null = () => {
  const button = selectStrategyExecButtonElement()
  if (button === null) {
    return null
  }
  return match(button.textContent)
    .with("Merge pull request", () => "Merge" as const)
    .with("Squash and merge", () => "Squash" as const)
    .with("Rebase and merge", () => "Rebase" as const)
    .otherwise(() => null)
}
