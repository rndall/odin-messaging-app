import { createLink } from "@tanstack/react-router"
import { LinkButton as LinkButtonPrimitive } from "@workspace/ui/components/button"
import { SidebarMenuButton } from "@workspace/ui/components/sidebar"

export const LinkButton = createLink(LinkButtonPrimitive)
export const SidebarMenuButtonLink = createLink(SidebarMenuButton)
