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

  return (
    <div className="flex flex-col max-w-5xl mx-auto py-10">
      <h1 className="text-4xl text-gh font-bold">GitHub Merge Guardian</h1>
      <h2 className="text-2xl text-gh font-semibold mt-8 pb-2">Rulesets</h2>
      <hr className="h-px bg-muted border-0"></hr>
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
          <div className="flex justify-between w-full">
            <div className="w-8 flex items-center justify-center">
              <SortingIcon className="w-5 h-5" />
            </div>
            <p className="w-44 mr-4 text-lg text-gh font-normal">Owner</p>
            <p className="w-44 mr-4 text-lg text-gh font-normal">Repository</p>
            <p className="w-44 mr-4 text-lg text-gh font-normal">Base branch</p>
            <p className="w-44 mr-4 text-lg text-gh font-normal">
              Compare branch
            </p>
            <p className="flex-1 text-lg text-gh font-normal">Merge strategy</p>
            {/* This is dummy for indent. not good... */}
            <div className="w-6 h-6"></div>
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
        className="self-start mt-4 text-white bg-primary hover:bg-primaryHover font-semibold rounded-lg px-4 py-2"
        onClick={handleAddSetting}>
        Add
      </button>
      {hasError && (
        <span className="mt-4 text-red-500 text-xl font-bold">
          Update settings has failed. Please try again.
        </span>
      )}
      <div>
        <h2 className="text-2xl text-gh font-semibold mt-8 pb-2">Color</h2>
        <hr className="h-px bg-muted border-0"></hr>
        <p className="mt-8 text-xl">
          Customize the merge button&apos;s color to emphasize the
          attention-grabbing effect. Select your preferred color from the color
          picker below to set it. You can also change the color from{" "}
          <span className="font-medium">the extension&apos;s popup.</span> As
          you update a color, it is automatically saved.
        </p>
        <div className="grid grid-cols-2 mt-4 gap-4 max-w-xl">
          <span className="text-lg text-gh font-normal">Color Picker</span>
          <span className="text-lg text-gh font-normal">Example</span>
          <input
            type="color"
            className="w-16 h-8"
            value={color}
            onChange={(e) => handleSetColor(e.target.value)}
          />
          <span
            style={{ backgroundColor: color }}
            className=" text-white text-sm w-48 rounded-lg px-4 py-2">
            Merge pull request
          </span>
        </div>
        <button
          className="self-start mt-4 text-gh border border-ghgrayBorder bg-ghgray hover:bg-ghgrayHover font-semibold rounded-lg px-4 py-2"
          onClick={handleResetColor}>
          Reset to Defaults
        </button>
        {hasErrorColor && (
          <span className="mt-4 text-red-500 text-xl font-bold">
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
      <div className="flex mt-4 items-center w-full">
        <button className="w-8 h-full flex justify-center" {...listeners}>
          <SortableIcon className="w-6 h-6 hover:bg-gray-200 rounded-full" />
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
          className="flex-1 p-3 mr-4 text-base text-gh border border-gray-300 rounded-lg bg-gray-50 outline-gray-500 box-border"
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
          <TrashIcon className="w-6 h-6 hover:fill-red-500" />
        </button>
      </div>
    </li>
  )
}

const Input: React.FC<ComponentProps<"input">> = (props) => (
  <input
    required
    className="invalid:border-red-300 w-44 mr-4 p-3 text-base text-gh border border-gray-300 rounded-lg bg-gray-50 outline-gray-500 box-border"
    {...props}
  />
)

const SortingIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
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
    xmlns="http://www.w3.org/2000/svg"
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
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    className={className}>
    <path d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z" />
  </svg>
)

export default IndexOptions
