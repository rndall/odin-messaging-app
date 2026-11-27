import { socket } from "@/lib/socket"
import { SendHorizontalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useForm } from "@tanstack/react-form"
import { getRouteApi } from "@tanstack/react-router"

import { sendMessageBodySchema } from "@workspace/shared"
import { Field, FieldGroup } from "@workspace/ui/components/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group"

const route = getRouteApi("/_authed/$conversationId")

export default function ConversationInput() {
  const { conversationId } = route.useParams()

  const form = useForm({
    defaultValues: {
      content: "",
    },
    validators: {
      onSubmit: sendMessageBodySchema.pick({ content: true }),
    },
    onSubmit: async ({ value: { content } }) => {
      socket.emit("sendMessage", { content, conversationId })
    },
  })

  return (
    <div className="px-4 pb-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup>
          <form.Field
            name="content"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <InputGroup>
                    <InputGroupInput
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Aa"
                      autoComplete="off"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        isDisabled={!field.state.value}
                        type="submit"
                        size="icon-sm"
                      >
                        <HugeiconsIcon icon={SendHorizontalIcon} />
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              )
            }}
          />
        </FieldGroup>
      </form>
    </div>
  )
}
