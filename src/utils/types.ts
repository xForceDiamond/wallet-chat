import { MetaMaskInpageProvider } from '@metamask/providers'
import { Wallet } from 'ethers'
import { StreamrClient, Stream } from 'streamr-client'

export type MessagePayload = {
    body: string
    createdAt: number
    sender: string
    id: string
}

export type MessagesCollection = {
    [index: string]: Array<MessagePayload>
}

export type DraftCollection = {
    [index: string]: string
}

export type ChatState = {
    drafts: any
    identity?: string
    messages: MessagesCollection
    roomId?: string
    roomNameEditable: boolean
    rooms: ChatRoom[]
    metamaskAddress: string
    session: StreamrSession
}

export enum MessageType {
    TEXT = 'text',
    METADATA = 'metadata',
}
export interface ChatMessage {
    type: MessageType
    payload: string
}

export interface StreamrSession {
    wallet: Wallet | undefined
    streamrClient: StreamrClient | undefined
    provider: MetaMaskInpageProvider | undefined
}

export interface ChatRoom {
    id: string
    name: string
    stream: Stream
    publishMessage: (message: string) => Promise<void>
    publishMetadata: (metadata: any) => Promise<void>
    subscribeMessages: (callback: (message: ChatMessage) => void) => void
    subscribeMetadata: (callback: (metadata: any) => void) => void
}
