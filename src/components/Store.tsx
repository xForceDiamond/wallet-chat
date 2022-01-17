import { createContext, useContext, useReducer } from 'react'
import StreamrClient from 'streamr-client'
import { ChatRoom, StreamrSession } from '../utils/types'

import type {
    ChatState,
    MessagePayload,
    MessagesCollection,
    DraftCollection,
} from '../utils/types'
import { Wallet } from 'ethers'
import { MetamaskDelegatedAccess } from '../lib/MetamaskDelegatedAccess'

const initialState = {
    drafts: {},
    identity: undefined,
    messages: {},
    roomId: undefined,
    roomNameEditable: false,
    rooms: [],
    metamaskAddress: '',
    session: {
        wallet: undefined,
        streamrClient: undefined,
    } as StreamrSession,
} as ChatState

export enum ActionType {
    AddMessages = 'add messages',
    AddRooms = 'add rooms',
    EditRoomName = 'edit room name',
    RenameRoom = 'rename room',
    Reset = 'reset',
    SelectRoom = 'select room',
    SetDraft = 'set draft',
    SetIdentity = 'set identity',
    SetMessages = 'set messages',
    SetRooms = 'set rooms',
    SetSession = 'set session',
}

type Action<A, B> = {
    type: A
    payload: B
}

type SelectRoomAction = Action<ActionType.SelectRoom, string>

type AddRoomsAction = Action<ActionType.AddRooms, ChatRoom[]>

type SetRoomsAction = Action<ActionType.SetRooms, ChatRoom[]>

type AddMessagesAction = Action<ActionType.AddMessages, MessagePayload[]>

type SetMessagesAction = Action<ActionType.SetMessages, MessagePayload[]>

type SetIdentityAction = Action<ActionType.SetIdentity, string | undefined>

type ResetAction = Omit<Action<ActionType.Reset, undefined>, 'payload'>

type SetDraftAction = Action<ActionType.SetDraft, string>

type RenameRoomAction = Action<ActionType.RenameRoom, string>

type EditRoomNameAction = Action<ActionType.EditRoomName, boolean>

type SetSessionAction = Action<ActionType.SetSession, MetamaskDelegatedAccess>

type A =
    | SelectRoomAction
    | AddRoomsAction
    | SetRoomsAction
    | AddMessagesAction
    | SetMessagesAction
    | SetIdentityAction
    | ResetAction
    | SetDraftAction
    | RenameRoomAction
    | EditRoomNameAction
    | SetSessionAction

function reducer(state: ChatState, action: A): ChatState {
    switch (action.type) {
        case ActionType.EditRoomName:
            return {
                ...state,
                roomNameEditable: action.payload,
            }
        case ActionType.RenameRoom:
            ;((room: ChatRoom | undefined) => {
                if (room) {
                    room.name = action.payload
                }
            })(state.rooms.find(({ id }) => id === state.roomId))

            return {
                ...state,
                roomNameEditable: false,
            }
        case ActionType.SetDraft:
            return !state.roomId
                ? state
                : {
                      ...state,
                      drafts: {
                          ...state.drafts,
                          [state.roomId]: action.payload,
                      },
                  }
        case ActionType.Reset:
            return initialState
        case ActionType.SetIdentity:
            return {
                ...state,
                identity: action.payload,
            }
        case ActionType.SelectRoom:
            return {
                ...state,
                roomId: action.payload,
                roomNameEditable: false,
            }
        case ActionType.SetRooms:
            return {
                ...state,
                roomId:
                    !state.roomId && action.payload.length
                        ? action.payload[0].id
                        : state.roomId,
                rooms: action.payload,
                messages: action.payload.reduce(
                    (memo: MessagesCollection, { id }: ChatRoom) => {
                        Object.assign(memo, {
                            [id]: state.messages[id] || [],
                        })

                        return memo
                    },
                    {}
                ),
                drafts: action.payload.reduce(
                    (memo: DraftCollection, { id }: ChatRoom) => {
                        Object.assign(memo, {
                            [id]: state.drafts[id] || '',
                        })

                        return memo
                    },
                    {}
                ),
            }
        case ActionType.AddRooms:
            return reducer(state, {
                type: ActionType.SetRooms,
                payload: [...state.rooms, ...action.payload],
            })
        case ActionType.SetMessages:
            return state.roomId == null
                ? state
                : {
                      ...state,
                      messages: {
                          ...state.messages,
                          [state.roomId]: action.payload,
                      },
                  }
        case ActionType.AddMessages:
            return state.roomId == null
                ? state
                : reducer(state, {
                      type: ActionType.SetMessages,
                      payload: [
                          ...state.messages[state.roomId],
                          ...action.payload,
                      ],
                  })
        case ActionType.SetSession:
            const { session, metamask, provider } = action.payload

            const streamrClient = new StreamrClient({
                auth: {
                    privateKey: session.privateKey,
                },
            })

            return {
                ...state,
                metamaskAddress: metamask.address,
                session: {
                    wallet: new Wallet(session.privateKey),
                    streamrClient,
                    provider: provider,
                },
            }
        default:
            return state
    }
}

type Props = {
    children?: React.ReactNode
}

const StateContext = createContext<ChatState>(initialState)

type DispatchFn = (arg0: A) => void

const DispatchContext = createContext<DispatchFn>(() => {})

export function useStore() {
    return useContext(StateContext)
}

export function useDispatch() {
    return useContext(DispatchContext)
}

const NO_MESSAGES: MessagePayload[] = []

export function useMessages(): MessagePayload[] {
    const { roomId, messages } = useStore()

    if (roomId == null) {
        return NO_MESSAGES
    }

    return messages[roomId]
}

export function useRoom(): ChatRoom | undefined {
    const { roomId, rooms } = useStore()

    return rooms.find(({ id }) => roomId === id)
}

export function useDraft(): string {
    const { roomId, drafts } = useStore()

    if (!roomId) {
        return ''
    }

    return drafts[roomId]
}

export default function Store({ children }: Props) {
    const [state, dispatch] = useReducer(reducer, initialState)

    return (
        <DispatchContext.Provider value={dispatch}>
            <StateContext.Provider value={state}>
                {children}
            </StateContext.Provider>
        </DispatchContext.Provider>
    )
}
