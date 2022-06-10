import { ButtonHTMLAttributes, useState } from 'react'
import { StreamPermission } from 'streamr-client'
import tw from 'twin.macro'
import {
    useDelegatedAccount,
    useDelegatedClient,
    useIsDelegating,
} from '$/features/delegation/hooks'
import {
    useCurrentDelegationAbility,
    useLoadCurrentDelegationAbilityEffect,
} from '$/features/permission/hooks'
import useMessages from '$/hooks/useMessages'
import AddMemberModal from '../modals/AddMemberModal'
import EditMembersModal from '../modals/EditMembersModal'
import ConversationHeader from './ConversationHeader'
import EmptyMessageFeed from './EmptyMessageFeed'
import MessageFeed from './MessageFeed'
import MessageInput from './MessageInput'
import MessageInputPlaceholder from './MessageInputPlaceholder'
import Text from '../Text'
import SecondaryButton from '../SecondaryButton'
import { useDispatch } from 'react-redux'
import { useSelectedRoomId } from '$/features/room/hooks'
import { DelegationAction } from '$/features/delegation'
import { MemberAction } from '$/features/member'
import RoomPropertiesModal from '../modals/RoomPropertiesModal'
import useCanGrant from '$/hooks/useCanGrant'
import useJustInvited from '$/hooks/useJustInvited'
import { useWalletAccount } from '$/features/wallet/hooks'
import Spinner from '$/components/Spinner'

export default function Conversation() {
    const messages = useMessages()

    const [roomPropertiesModalOpen, setRoomPropertiesModalOpen] = useState<boolean>(false)

    const [addMemberModalOpen, setAddMemberModalOpen] = useState<boolean>(false)

    const [editMembersModalOpen, setEditMembersModalOpen] = useState<boolean>(false)

    const canGrant = useCanGrant()

    return (
        <>
            <ConversationHeader
                canModifyMembers={canGrant}
                onAddMemberClick={() => void setAddMemberModalOpen(true)}
                onEditMembersClick={() => void setEditMembersModalOpen(true)}
                onRoomPropertiesClick={() => void setRoomPropertiesModalOpen(true)}
            />
            <div
                css={[
                    tw`
                        h-full
                        pt-[92px]
                        pb-[92px]
                    `,
                ]}
            >
                <div tw="h-full">
                    {(messages || []).length ? (
                        <div
                            css={[
                                tw`
                                    h-full
                                    flex
                                    flex-col
                                `,
                            ]}
                        >
                            <div tw="flex-grow" />
                            <MessageFeed messages={messages} />
                        </div>
                    ) : (
                        <EmptyMessageFeed
                            canModifyMembers={canGrant}
                            onAddMemberClick={() => void setAddMemberModalOpen(true)}
                        />
                    )}
                </div>
            </div>
            <div
                css={[
                    tw`
                        absolute
                        p-6
                        bottom-0
                        left-0
                        w-full
                    `,
                ]}
            >
                <MessageBox canGrant={canGrant} />
            </div>
            <>
                <AddMemberModal
                    canModifyMembers={canGrant}
                    open={addMemberModalOpen}
                    setOpen={setAddMemberModalOpen}
                />
                <EditMembersModal
                    canModifyMembers={canGrant}
                    open={editMembersModalOpen}
                    setOpen={setEditMembersModalOpen}
                />
                <RoomPropertiesModal
                    open={roomPropertiesModalOpen}
                    setOpen={setRoomPropertiesModalOpen}
                />
            </>
        </>
    )
}

interface MessageBoxProps {
    canGrant?: boolean
}

function MessageBox({ canGrant = false }: MessageBoxProps) {
    const delegatedClient = useDelegatedClient()

    const canDelegatedPublish = useCurrentDelegationAbility(StreamPermission.PUBLISH)

    useLoadCurrentDelegationAbilityEffect(StreamPermission.PUBLISH)

    const canDelegatedSubscribe = useCurrentDelegationAbility(StreamPermission.SUBSCRIBE)

    useLoadCurrentDelegationAbilityEffect(StreamPermission.SUBSCRIBE)

    const dispatch = useDispatch()

    const delegatedAccount = useDelegatedAccount()

    const selectedRoomId = useSelectedRoomId()

    const address = useWalletAccount()

    const justInvited = useJustInvited(selectedRoomId, address)

    const isDelegating = useIsDelegating()

    if (canDelegatedPublish && canDelegatedSubscribe) {
        // We can stop here. For publishing that's all that matters.
        return <MessageInput />
    }

    if (!delegatedClient) {
        return (
            <MessageInputPlaceholder
                cta={
                    <Cta
                        busy={isDelegating}
                        disabled={isDelegating}
                        onClick={() => {
                            if (!isDelegating) {
                                dispatch(DelegationAction.requestPrivateKey())
                            }
                        }}
                    >
                        {isDelegating ? <>Delegating…</> : <>Delegate now</>}
                    </Cta>
                }
            >
                Publishing messages requires room access delegation.
            </MessageInputPlaceholder>
        )
    }

    if (justInvited) {
        return (
            <MessageInputPlaceholder
                cta={
                    <Cta
                        onClick={() => {
                            if (!selectedRoomId || !delegatedAccount || !address) {
                                return
                            }

                            dispatch(
                                MemberAction.setPermissions({
                                    roomId: selectedRoomId,
                                    assignments: [
                                        {
                                            user: delegatedAccount,
                                            permissions: [
                                                StreamPermission.PUBLISH,
                                                StreamPermission.SUBSCRIBE,
                                            ],
                                        },
                                        {
                                            user: address,
                                            permissions: [
                                                StreamPermission.GRANT,
                                                StreamPermission.EDIT,
                                            ],
                                        },
                                    ],
                                })
                            )
                        }}
                    >
                        Accept
                    </Cta>
                }
            >
                You've been invited into this room.
            </MessageInputPlaceholder>
        )
    }

    if (canGrant) {
        return (
            <MessageInputPlaceholder
                cta={
                    <Cta
                        onClick={() => {
                            if (!selectedRoomId || !delegatedAccount) {
                                return
                            }

                            dispatch(
                                MemberAction.setPermissions({
                                    roomId: selectedRoomId,
                                    assignments: [
                                        {
                                            user: delegatedAccount,
                                            permissions: [
                                                StreamPermission.PUBLISH,
                                                StreamPermission.SUBSCRIBE,
                                            ],
                                        },
                                    ],
                                })
                            )
                        }}
                    >
                        Promote it
                    </Cta>
                }
            >
                Your delegated account is not a publisher in this room.
            </MessageInputPlaceholder>
        )
    }

    return <MessageInput disabled />
}

type CtaProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    busy?: boolean
}

function Cta({ children, busy = false, ...props }: CtaProps) {
    return (
        <SecondaryButton
            {...props}
            css={[
                tw`
                    text-[0.875rem]
                    h-8
                    px-4
                `,
            ]}
        >
            <div
                css={[
                    tw`
                        flex
                        items-center
                    `,
                ]}
            >
                <div>
                    <Text>{children}</Text>
                </div>
                {busy && (
                    <div
                        css={[
                            tw`
                            ml-2
                            relative
                            w-4
                            h-4
                        `,
                        ]}
                    >
                        <Spinner r={5} strokeWidth={1} />
                    </div>
                )}
            </div>
        </SecondaryButton>
    )
}
