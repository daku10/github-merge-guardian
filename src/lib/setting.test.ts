import { describe, expect, it } from "vitest"

import { getMatchedSetting, parseSetting } from "./setting"

describe("parseSetting", () => {
  it("must be parsed", () => {
    const actual = parseSetting({
      owner: "exampleOwner",
      repositoryName: "exampleRepositoryName",
      baseBranch: "exampleBaseBranch",
      compareBranch: "exampleCompareBranch",
      strategy: "Merge"
    })
    expect(actual).toStrictEqual({
      owner: "exampleOwner",
      repositoryName: "exampleRepositoryName",
      baseBranch: "exampleBaseBranch",
      compareBranch: "exampleCompareBranch",
      strategy: "Merge"
    })
  })

  it("must be failed with invalid strategy", () => {
    const actual = parseSetting({
      owner: "exampleOwner",
      repositoryName: "exampleRepositoryName",
      baseBranch: "exampleBaseBranch",
      compareBranch: "exampleCompareBranch",
      strategy: "Invalid Strategy"
    })
    expect(actual).toBe(null)
  })
})

describe("getMatchedSetting", () => {
  it("must be matched", () => {
    const actual = getMatchedSetting(
      "exampleOwner",
      "exampleRepositoryName",
      "exampleBaseBranch",
      "exampleCompareBranch",
      [
        {
          id: "exampleId",
          owner: "exampleOwner",
          repositoryName: "exampleRepositoryName",
          baseBranch: "exampleBaseBranch",
          compareBranch: "exampleCompareBranch",
          strategy: "Merge"
        }
      ]
    )
    expect(actual).toStrictEqual({
      id: "exampleId",
      owner: "exampleOwner",
      repositoryName: "exampleRepositoryName",
      baseBranch: "exampleBaseBranch",
      compareBranch: "exampleCompareBranch",
      strategy: "Merge"
    })
  })

  it("returns null if not matched", () => {
    const actual = getMatchedSetting(
      "exampleOwner",
      "exampleRepositoryName",
      "exampleBaseBranch",
      "exampleCompareBranch",
      [
        {
          id: "not match id",
          owner: "example",
          repositoryName: "example",
          baseBranch: "example",
          compareBranch: "example",
          strategy: "Merge"
        }
      ]
    )
    expect(actual).toBe(null)
  })

  it("must be matched with wildcard", () => {
    const actual = getMatchedSetting(
      "exampleOwner",
      "exampleRepositoryName",
      "exampleBaseBranch",
      "exampleCompareBranch",
      [
        {
          id: "exampleId",
          owner: "example*",
          repositoryName: "example*",
          baseBranch: "example*",
          compareBranch: "example*",
          strategy: "Squash"
        }
      ]
    )
    expect(actual).toStrictEqual({
      id: "exampleId",
      owner: "example*",
      repositoryName: "example*",
      baseBranch: "example*",
      compareBranch: "example*",
      strategy: "Squash"
    })
  })

  it("must be matched with higher rule", () => {
    const actual = getMatchedSetting(
      "exampleOwner",
      "exampleRepositoryName",
      "exampleBaseBranch",
      "exampleCompareBranch",
      [
        {
          id: "not match id",
          owner: "example",
          repositoryName: "example",
          baseBranch: "example",
          compareBranch: "example",
          strategy: "Rebase"
        },
        {
          id: "exampleId",
          owner: "example*",
          repositoryName: "example*",
          baseBranch: "example*",
          compareBranch: "example*",
          strategy: "Squash"
        },
        {
          id: "exampleId2",
          owner: "exampleOwner",
          repositoryName: "exampleRepositoryName",
          baseBranch: "exampleBaseBranch",
          compareBranch: "exampleCompareBranch",
          strategy: "Merge"
        }
      ]
    )
    expect(actual).toStrictEqual({
      id: "exampleId",
      owner: "example*",
      repositoryName: "example*",
      baseBranch: "example*",
      compareBranch: "example*",
      strategy: "Squash"
    })
  })
})
