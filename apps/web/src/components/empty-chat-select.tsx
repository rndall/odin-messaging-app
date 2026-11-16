import { MessageBlockedIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function EmptyChatSelect() {
  return (
    <div className="flex flex-col items-center gap-8">
      <HugeiconsIcon icon={MessageBlockedIcon} className="size-16" />
      <p className="font-heading text-2xl font-bold">No chats selected</p>
    </div>
  )
}
