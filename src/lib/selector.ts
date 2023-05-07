import { match } from "ts-pattern"

import { STRATEGIES, type Strategy } from "./constantAndType"

// this can be matched pull request commits, checks and files page.
const regex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/\d+/

export const retrieveRepositorySlug: () => [
  string | null,
  string | null
] = () => {
  const match = window.location.href.match(regex)
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
  // this is not `button` element
  return document.querySelector<HTMLElement>(".js-merge-method-menu-button")
}

export const selectStrategySelectButtonElement = (storategy: Strategy) => {
  const value = match(storategy)
    .with("Merge", () => "merge")
    .with("Squash", () => "squash")
    .with("Rebase", () => "rebase")
    .exhaustive()
  return document.querySelector<HTMLButtonElement>(
    `.merge-message details button[value=${value}]`
  )
}

const execButtonClass = (storategy: Strategy) => {
  const value = match(storategy)
    .with("Merge", () => "merge")
    .with("Squash", () => "squash")
    .with("Rebase", () => "rebase")
    .exhaustive()
  return `btn-group-${value}`
}

export const selectParentStrategyExecElement = () => {
  return document.querySelector(".merge-message .BtnGroup")
}

export const selectStrategyExecButtonElement = (storategy: Strategy) => {
  return document.querySelector<HTMLButtonElement>(
    `.merge-message .merge-box-button.${execButtonClass(storategy)}`
  )
}

export const retrieveSelectedStrategy = () => {
  const buttons = STRATEGIES.map((s) => selectStrategyExecButtonElement(s))
    .filter((b): b is HTMLButtonElement => b !== null)
    .filter((e) => {
      const computedStyle = getComputedStyle(e)
      return computedStyle.display !== "none"
    })

  const button = buttons[0]
  if (button === undefined) {
    return null
  }

  const classList = button.classList
  for (const s of STRATEGIES) {
    if (classList.contains(execButtonClass(s))) {
      return s
    }
  }
  return null
}
