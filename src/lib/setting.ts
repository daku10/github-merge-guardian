import { STRATEGIES, type Setting, type Strategy } from "./constantAndType"

export const getMatchedSetting: (
  owner: string,
  repositoryName: string,
  baseBranch: string,
  compareBranch: string,
  settings: Setting[]
) => Setting | null = (
  owner,
  repositoryName,
  baseBranch,
  compareBranch,
  settings
) => {
  return (
    settings.find((s) =>
      matchSetting(s, owner, repositoryName, baseBranch, compareBranch)
    ) ?? null
  )
}

export const parseSetting: (setting: object) => Setting | null = (setting) => {
  if (
    !(
      Object.hasOwn(setting, "owner") &&
      Object.hasOwn(setting, "repositoryName") &&
      Object.hasOwn(setting, "baseBranch") &&
      Object.hasOwn(setting, "compareBranch") &&
      Object.hasOwn(setting, "strategy")
    )
  ) {
    return null
  }
  const s = setting as {
    owner: unknown
    repositoryName: unknown
    baseBranch: unknown
    compareBranch: unknown
    strategy: unknown
  }
  if (
    typeof s.owner !== "string" ||
    typeof s.repositoryName !== "string" ||
    typeof s.baseBranch !== "string" ||
    typeof s.compareBranch !== "string" ||
    typeof s.strategy !== "string" ||
    !STRATEGIES.includes(s.strategy as Strategy)
  ) {
    return null
  }
  return s as Setting
}

const matchSetting = (
  setting: Setting,
  owner: string,
  repositoryName: string,
  baseBranch: string,
  compareBranch: string
) => {
  const ownerRegex = new RegExp(`^${setting.owner.replaceAll("*", ".*")}$`)
  const repositoryNameRegex = new RegExp(
    `^${setting.repositoryName.replaceAll("*", ".*")}$`
  )
  const baseBranchRegex = new RegExp(
    `^${setting.baseBranch.replaceAll("*", ".*")}$`
  )
  const compareBranchRegex = new RegExp(
    `^${setting.compareBranch.replaceAll("*", ".*")}$`
  )

  return (
    ownerRegex.test(owner) &&
    repositoryNameRegex.test(repositoryName) &&
    baseBranchRegex.test(baseBranch) &&
    compareBranchRegex.test(compareBranch)
  )
}
