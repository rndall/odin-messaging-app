import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group"

export function PasswordInput({
  ...props
}: Omit<React.ComponentProps<typeof InputGroupInput>, "type">) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  return (
    <InputGroup>
      <InputGroupInput
        type={isPasswordVisible ? "text" : "password"}
        {...props}
      />
      {props.value && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <HugeiconsIcon
              icon={isPasswordVisible ? ViewOffSlashIcon : ViewIcon}
            />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
