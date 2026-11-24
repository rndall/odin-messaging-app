import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import { useOnInView } from "react-intersection-observer"

import { getFirstTwoInitials, getUserText } from "@workspace/shared/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Bubble, BubbleContent } from "@workspace/ui/components/bubble"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@workspace/ui/components/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@workspace/ui/components/message-scroller"
import { Spinner } from "@workspace/ui/components/spinner"

const route = getRouteApi("/_authed/$conversationId")

export default function ConversationMessages() {
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  const context = route.useRouteContext()
  const { data: me } = useSuspenseQuery(context.meQueryOptions)
  const { data: conversation } = useSuspenseQuery(
    context.conversationQueryOptions
  )
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(context.messagesQueryOptions)

  const ref = useOnInView(
    (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    { root, rootMargin: "200px 0px 0px 0px" }
  )

  const messages = useMemo(
    () => data.pages.flatMap((page) => page.data).reverse(),
    [data.pages]
  )

  return (
    <div className="flex min-h-0 flex-1">
      {messages.length === 0 ? (
        <Empty className="flex-1">
          <EmptyHeader>
            <EmptyTitle>No messages yet</EmptyTitle>
            <EmptyDescription>
              Send a message to start the conversation.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <MessageScrollerProvider autoScroll>
          <MessageScroller>
            <MessageScrollerViewport ref={setRoot}>
              <MessageScrollerContent className="justify-end px-4 pb-4">
                {messages.map((message) => {
                  const senderText = getUserText(message.sender)
                  const isOwn = message.sender.id === me.id

                  return (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                    >
                      <Message align={isOwn ? "end" : "start"}>
                        {!isOwn && (
                          <MessageAvatar>
                            <Avatar size="sm">
                              <AvatarImage
                                src={
                                  message.sender.profileInfo?.avatarUrl ??
                                  undefined
                                }
                                alt={senderText}
                              />
                              <AvatarFallback>
                                {getFirstTwoInitials(senderText)}
                              </AvatarFallback>
                            </Avatar>
                          </MessageAvatar>
                        )}
                        <MessageContent>
                          {!isOwn && conversation.type === "group" && (
                            <MessageHeader>{senderText}</MessageHeader>
                          )}
                          <Bubble
                            variant={isOwn ? "default" : "secondary"}
                            align={isOwn ? "end" : "start"}
                          >
                            <BubbleContent>{message.content}</BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  )
                })}
                {hasNextPage && (
                  <div className="relative order-first grid h-8 place-items-center">
                    <div
                      ref={ref}
                      className="absolute inset-x-0 top-0 h-px"
                      aria-hidden
                    />
                    {isFetchingNextPage && <Spinner className="size-5" />}
                  </div>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      )}
    </div>
  )
}
