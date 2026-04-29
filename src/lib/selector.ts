import { match } from "ts-pattern"

import type { Strategy } from "./constantAndType"

// this can be matched pull request commits, checks and files page.
const regex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/\d+/
const branchLinkSelector = 'a[href*="/tree/"]'

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
  return document.querySelector<HTMLElement>("[data-testid='mergebox-partial']")
}

const normalizeText = (text: string | null | undefined) => {
  return text?.replaceAll(/\s+/g, " ").trim() ?? ""
}

const extractBranchNameFromHref = (href: string | null) => {
  if (href === null) {
    return null
  }
  const pathname = new URL(href, window.location.origin).pathname
  const match = /^\/[^/]+\/[^/]+\/tree\/(.+)$/.exec(pathname)
  const branchName = match?.[1]
  if (branchName === undefined) {
    return null
  }
  return decodeURIComponent(branchName)
}

const readBranchNameFromLink = (link: HTMLAnchorElement) => {
  const text = normalizeText(link.textContent)
  if (text !== "") {
    return text
  }
  return extractBranchNameFromHref(link.getAttribute("href"))
}

const collectUniqueBranchLinks = (root: ParentNode) => {
  const branchNames = new Set<string>()
  return Array.from(
    root.querySelectorAll<HTMLAnchorElement>(branchLinkSelector)
  ).filter((link) => {
    const branchName = readBranchNameFromLink(link)
    if (branchName === null || branchNames.has(branchName)) {
      return false
    }
    branchNames.add(branchName)
    return true
  })
}

const findBranchSummaryContainer = () => {
  return (
    Array.from(
      document.querySelectorAll<HTMLElement>("div, section, article")
    ).find((element) => {
      const text = normalizeText(element.textContent).toLowerCase()
      return (
        element.querySelectorAll(branchLinkSelector).length >= 2 &&
        text.includes("wants to merge") &&
        text.includes("from")
      )
    }) ?? null
  )
}

const selectPullRequestBranchNames: () => {
  baseBranch: string
  compareBranch: string
} | null = () => {
  const root = findBranchSummaryContainer()
  if (root !== null) {
    const links = collectUniqueBranchLinks(root)
    const baseBranch = links[0] ? readBranchNameFromLink(links[0]) : null
    const compareBranch = links[1] ? readBranchNameFromLink(links[1]) : null
    if (baseBranch !== null && compareBranch !== null) {
      return { baseBranch, compareBranch }
    }
  }

  // Keep the legacy selectors as the last fallback because GitHub still
  // exposes them in some page variants.
  const baseBranch =
    normalizeText(document.querySelector(".base-ref")?.textContent) || null
  const compareBranch =
    normalizeText(document.querySelector(".head-ref")?.textContent) || null
  if (baseBranch !== null && compareBranch !== null) {
    return { baseBranch, compareBranch }
  }
  return null
}

export const selectBaseBranchText: () => string | null = () => {
  return selectPullRequestBranchNames()?.baseBranch ?? null
}

export const selectCompareBranchText: () => string | null = () => {
  return selectPullRequestBranchNames()?.compareBranch ?? null
}

export const selectMenuButtonElement = () => {
  // TODO: it's fragile but I have no idea how to select the button.
  return document.querySelector<HTMLButtonElement>(
    '[data-component="IconButton"][data-variant="primary"][data-size="medium"]'
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
