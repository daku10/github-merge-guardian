export const STRATEGIES = ["Merge", "Squash", "Rebase"] as const
export const DEFAULT_COLOR = "#ff8c00"
export type Strategy = (typeof STRATEGIES)[number]
export type Setting = {
  id: string
  owner: string
  repositoryName: string
  baseBranch: string
  compareBranch: string
  strategy: Strategy
}
