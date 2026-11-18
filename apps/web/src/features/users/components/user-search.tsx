import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { useDebounce } from "@/hooks/use-debounce"
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

export default function UserSearch() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  const { data, refetch, isPending, error } = useQuery({
    ...userQueries.list({ search: debouncedSearch }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })

  // TODO: Handle error
  if (error) return

  return (
    <div>
      <Combobox
        allowsCustomValue
        allowsEmptyCollection
        menuTrigger="focus"
        onInputChange={setSearch}
        inputValue={search}
        aria-label="Send message to"
        items={data}
      >
        <ComboboxInput autoFocus showTrigger={false} onFocus={() => refetch()}>
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
                {isPending ? <Spinner /> : "No items found."}
              </ComboboxEmpty>
            )}
          >
            {!isPending &&
              data.map((user) => (
                <ComboboxItem
                  onPress={() => console.log(user)}
                  key={user.id}
                  id={user.id}
                  textValue={user.profileInfo.displayName || user.username}
                >
                  <Item size="xs">
                    <ItemMedia>
                      <Avatar>
                        <AvatarImage
                          src={user.profileInfo.avatarUrl ?? undefined}
                        />
                        <AvatarFallback>
                          {user.profileInfo.displayName
                            ? user.profileInfo.displayName[0].toUpperCase()
                            : user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent>
                      {!user.profileInfo.displayName ? (
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
