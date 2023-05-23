import { type ComponentProps, useCallback } from "react"

import "./style.css"

import { DndContext } from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { sendToBackground } from "@plasmohq/messaging"

import {
  DEFAULT_COLOR,
  type Setting,
  type Strategy
} from "~lib/constantAndType"
import { UPDATE_COLOR, UPDATE_SETTINGS } from "~lib/message"
import { useColor, useSettings } from "~lib/storage"
import { usePopoverPicker } from "~lib/usePopoverPicker"
import { detectBrowser } from "~lib/util"

const notifyUpdateSettings = (settings: Setting[]) => {
  sendToBackground<{ settings: Setting[] }>({
    name: UPDATE_SETTINGS,
    body: {
      settings
    }
  }).catch((e) => {
    console.error(e)
  })
}

const notifyUpdateColor = (color: string) => {
  sendToBackground<{ color: string }>({
    name: UPDATE_COLOR,
    body: {
      color
    }
  }).catch((e) => {
    console.error(e)
  })
}

function IndexOptions() {
  const {
    settings,
    addSetting,
    changeSetting,
    moveSettings,
    removeSetting,
    hasError
  } = useSettings()

  const { color, setColor, hasError: hasErrorColor } = useColor()

  const handleAddSetting = useCallback(() => {
    notifyUpdateSettings(addSetting())
  }, [addSetting])

  const handleChangeSetting = useCallback(
    (index: number, setting: Partial<Setting>) => {
      notifyUpdateSettings(changeSetting(index, setting))
    },
    [changeSetting]
  )

  const handleMoveSetting = useCallback(
    (oldIndex: number, newIndex: number) => {
      notifyUpdateSettings(moveSettings(oldIndex, newIndex))
    },
    [moveSettings]
  )

  const handleRemoveSetting = useCallback(
    (index: number) => {
      notifyUpdateSettings(removeSetting(index))
    },
    [removeSetting]
  )

  const handleSetColor = useCallback(
    (color: string) => {
      setColor(color)
      notifyUpdateColor(color)
    },
    [setColor]
  )

  const handleResetColor = useCallback(() => {
    handleSetColor(DEFAULT_COLOR)
  }, [handleSetColor])

  const { renderDisplay, renderPicker } = usePopoverPicker({
    color,
    onChange: handleSetColor,
    displayClassName: "w-16 h-8 rounded-lg border-red-300",
    pickerClassName: "mt-4"
  })

  const isFirefox = detectBrowser() === "firefox"

  return (
    <div className="mx-auto flex max-w-5xl flex-col py-10">
      <h1 className="text-4xl font-bold text-gh">GitHub Merge Guardian</h1>
      <h2 className="mt-8 pb-2 text-2xl font-semibold text-gh">Rulesets</h2>
      <hr className="h-px border-0 bg-muted"></hr>
      <p className="mt-8 text-xl">
        <span className="font-medium">Higher rules</span> take precedence over
        lower ones. When applying the rules, the first matching rule in the list
        determines the merge strategy. You can use an asterisk (*) as a wildcard
        for any item in the rule. As you update a rule, it is automatically
        saved.
      </p>
      <span className="text-xl"></span>
      <div className="mt-8">
        <div className="flex items-center">
          <div className="flex w-full justify-between">
            <div className="flex w-8 items-center justify-center">
              <SortingIcon className="h-5 w-5" />
            </div>
            <p className="mr-4 w-44 text-lg font-normal text-gh">Owner</p>
            <p className="mr-4 w-44 text-lg font-normal text-gh">Repository</p>
            <p className="mr-4 w-44 text-lg font-normal text-gh">Base branch</p>
            <p className="mr-4 w-44 text-lg font-normal text-gh">
              Compare branch
            </p>
            <p className="flex-1 text-lg font-normal text-gh">Merge strategy</p>
            {/* This is dummy for indent. not good... */}
            <div className="h-6 w-6"></div>
          </div>
        </div>

        <div>
          <DndContext
            onDragOver={(event) => {
              const { active, over } = event
              if (over === null) {
                return
              }
              if (active.id !== over.id) {
                const oldIndex = settings.findIndex(
                  (item) => item.id === active.id
                )
                const newIndex = settings.findIndex(
                  (item) => item.id === over.id
                )
                if (oldIndex !== newIndex) {
                  handleMoveSetting(oldIndex, newIndex)
                }
              }
            }}>
            <SortableContext
              items={settings}
              strategy={verticalListSortingStrategy}>
              <ul>
                {settings.map((setting, i) => (
                  <SortableFormItem
                    key={setting.id}
                    setting={setting}
                    index={i}
                    changeSetting={handleChangeSetting}
                    removeSetting={handleRemoveSetting}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      <button
        className="mt-4 self-start rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primaryHover"
        onClick={handleAddSetting}>
        Add
      </button>
      {hasError && (
        <span className="mt-4 text-xl font-bold text-red-500">
          Update settings has failed. Please try again.
        </span>
      )}
      <div>
        <h2 className="mt-8 pb-2 text-2xl font-semibold text-gh">Color</h2>
        <hr className="h-px border-0 bg-muted"></hr>
        <p className="mt-8 text-xl">
          Customize the merge button&apos;s color to emphasize the
          attention-grabbing effect. Select your preferred color from the color
          picker below to set it. You can also change the color from{" "}
          <span className="font-medium">the extension&apos;s popup.</span> As
          you update a color, it is automatically saved.
        </p>
        <div className="mt-4 grid max-w-xl grid-cols-2 gap-4">
          <span className="text-lg font-normal text-gh">Color Picker</span>
          <span className="text-lg font-normal text-gh">Example</span>
          {isFirefox ? (
            renderDisplay
          ) : (
            <input
              type="color"
              className="h-8 w-16"
              value={color}
              onChange={(e) => handleSetColor(e.target.value)}
            />
          )}
          <span
            style={{ backgroundColor: color }}
            className=" w-48 rounded-lg px-4 py-2 text-sm text-white">
            Merge pull request
          </span>
        </div>
        {isFirefox && renderPicker}
        <button
          className="mt-4 self-start rounded-lg border border-ghgrayBorder bg-ghgray px-4 py-2 font-semibold text-gh hover:bg-ghgrayHover"
          onClick={handleResetColor}>
          Reset to Defaults
        </button>
        {hasErrorColor && (
          <span className="mt-4 text-xl font-bold text-red-500">
            Update color has failed. Please try again.
          </span>
        )}
      </div>
    </div>
  )
}

type SortableFormItemProps = {
  setting: Setting
  index: number
  changeSetting: (i: number, setting: Partial<Setting>) => void
  removeSetting: (i: number) => void
}

const SortableFormItem = ({
  setting,
  index,
  changeSetting,
  removeSetting
}: SortableFormItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: setting.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }
  return (
    <li key={setting.id} ref={setNodeRef} style={style} {...attributes}>
      <div className="mt-4 flex w-full items-center">
        <button
          aria-label="sortable"
          className="flex h-full w-8 justify-center"
          {...listeners}>
          <SortableIcon className="h-6 w-6 rounded-full hover:bg-gray-200" />
        </button>
        <Input
          type="text"
          placeholder="Owner"
          value={setting.owner}
          onChange={(e) => {
            changeSetting(index, {
              owner: e.currentTarget.value
            })
          }}
        />
        <Input
          type="text"
          placeholder="Repository"
          value={setting.repositoryName}
          onChange={(e) => {
            changeSetting(index, {
              repositoryName: e.currentTarget.value
            })
          }}
        />
        <Input
          type="text"
          placeholder="main"
          value={setting.baseBranch}
          onChange={(e) => {
            changeSetting(index, { baseBranch: e.currentTarget.value })
          }}
        />
        <Input
          type="text"
          placeholder="feature/*"
          value={setting.compareBranch}
          onChange={(e) => {
            changeSetting(index, {
              compareBranch: e.currentTarget.value
            })
          }}
        />
        <select
          className="mr-4 box-border flex-1 rounded-lg border border-gray-300 bg-gray-50 p-3 text-base text-gh outline-gray-500"
          value={setting.strategy}
          onChange={(e) =>
            changeSetting(index, {
              strategy: e.currentTarget.value as Strategy
            })
          }>
          <option value="Merge">Create a merge commit</option>
          <option value="Squash">Squash and merge</option>
          <option value="Rebase">Rebase and merge</option>
        </select>
        <button
          className="outline-gray-500"
          onClick={() => {
            removeSetting(index)
          }}>
          <TrashIcon className="h-6 w-6 hover:fill-red-500" />
        </button>
      </div>
    </li>
  )
}

const Input: React.FC<ComponentProps<"input">> = (props) => (
  <input
    required
    aria-label="input"
    className="mr-4 box-border w-44 rounded-lg border border-gray-300 bg-gray-50 p-3 text-base text-gh outline-gray-500 invalid:border-red-300"
    {...props}
  />
)

const SortingIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
    />
  </svg>
)

const SortableIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
    />
  </svg>
)

const TrashIcon = ({ className }: { className?: string }) => (
  <svg role="img" viewBox="0 0 448 512" className={className}>
    <path d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z" />
  </svg>
)

export default IndexOptions
