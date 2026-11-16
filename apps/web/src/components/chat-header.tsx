import { SquarePenIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"

import { Button } from "@workspace/ui/components/button"
import {
  SidebarGroup,
  SidebarGroupLabel,
} from "@workspace/ui/components/sidebar"

export default function ChatHeader() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="justify-between">
        <Link to="/" className="text-xl font-bold">
          Chats
        </Link>
        <div>
          <Button size="icon">
            <HugeiconsIcon icon={SquarePenIcon} strokeWidth={2} />
          </Button>
        </div>
      </SidebarGroupLabel>
    </SidebarGroup>
  )
}
