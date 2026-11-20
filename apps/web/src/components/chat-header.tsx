import { SquarePenIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"

import { buttonVariants } from "@workspace/ui/components/button"
import {
  SidebarGroup,
  SidebarGroupLabel,
} from "@workspace/ui/components/sidebar"

export default function ChatHeader() {
  return (
    <SidebarGroup className="pb-0">
      <SidebarGroupLabel className="justify-between">
        <Link to="/" className="text-xl font-bold">
          Chats
        </Link>
        <div>
          <Link to="/new" className={buttonVariants({ size: "icon" })}>
            <HugeiconsIcon icon={SquarePenIcon} strokeWidth={2} />
          </Link>
        </div>
      </SidebarGroupLabel>
    </SidebarGroup>
  )
}
