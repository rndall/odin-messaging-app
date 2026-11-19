import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { useStartOrGetConversationMutation } from "@/features/conversations/hooks/use-start-or-get-conversation-mutation"
import { useDebounce } from "@/hooks/use-debounce"
import type { UsersReturn } from "@workspace/shared"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@workspace/ui/components/combobox"
import {
  InputGroupAddon,
  InputGroupText,
} from "@workspace/ui/components/input-group"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item"
import { Spinner } from "@workspace/ui/components/spinner"
import { userQueries } from "../queries"

const getUserText = (user: UsersReturn) =>
  user.profileInfo?.displayName || user.username

export default function UserSearch() {
  const [fieldState, setFieldState] = useState<{
    value: number | null
    inputValue: string
  }>({ value: null, inputValue: "" })
  const debouncedSearch = useDebounce(fieldState.inputValue, 300)

  const {
    data: users,
    refetch: refetchUsers,
    isPending: isUsersPending,
    error: usersError,
  } = useQuery({
    ...userQueries.list({ search: debouncedSearch }),
    refetchOnWindowFocus: false,
  })

  const {
    mutate: startOrGetConvo,
    isPending: isConvoPending,
    variables: convoVariables,
  } = useStartOrGetConversationMutation()

  // TODO: Handle error
  if (usersError) return

  const handleInputChange = (value: string) => {
    setFieldState((prevState) => ({
      inputValue: value,
      value: value === "" ? null : prevState.value,
    }))
  }

  return (
    <div>
      <Combobox
        allowsEmptyCollection
        menuTrigger="focus"
        onInputChange={handleInputChange}
        inputValue={fieldState.inputValue}
        aria-label="Send message to"
        items={users}
        value={fieldState.value}
        onChange={(value) => {
          if (typeof value !== "number") return

          const user = users?.find((u) => u.id === value)
          if (!user) return
          const inputValue = getUserText(user)

          startOrGetConvo(
            { toUserId: value },
            {
              onSuccess: () => {
                setFieldState({ inputValue, value })
              },
            }
          )
        }}
        onFocus={() => refetchUsers()}
        autoFocus
      >
        <ComboboxInput showTrigger={false}>
          <InputGroupAddon>
            <InputGroupText>To:</InputGroupText>
          </InputGroupAddon>
        </ComboboxInput>
        <ComboboxContent
          placement="bottom left"
          crossOffset={32}
          className="max-w-xs"
        >
          <ComboboxList
            renderEmptyState={() => (
              <ComboboxEmpty>
                {isUsersPending ? <Spinner /> : "No items found."}
              </ComboboxEmpty>
            )}
          >
            {!isUsersPending &&
              users.map((user) => (
                <ComboboxItem
                  key={user.id}
                  id={user.id}
                  textValue={getUserText(user)}
                  loading={
                    isConvoPending && convoVariables.toUserId === user.id
                  }
                >
                  <Item size="xs">
                    <ItemMedia>
                      <Avatar>
                        <AvatarImage
                          src={user.profileInfo?.avatarUrl ?? undefined}
                        />
                        <AvatarFallback>
                          {user.profileInfo?.displayName
                            ? user.profileInfo.displayName[0].toUpperCase()
                            : user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent>
                      {!user.profileInfo?.displayName ? (
                        <ItemTitle>{user.username}</ItemTitle>
                      ) : (
                        <>
                          <ItemTitle>{user.profileInfo.displayName}</ItemTitle>
                          <ItemDescription>{user.username}</ItemDescription>
                        </>
                      )}
                    </ItemContent>
                  </Item>
                </ComboboxItem>
              ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
