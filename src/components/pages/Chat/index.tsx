import { Fragment, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tw from 'twin.macro'
import { useAccount } from '../../../features/wallet'
import Page from '../../Page'
import WalletModal from '../../WalletModal'
import AccountModal from './AccountModal'
import Nav from './Nav'

function UnwrappedChat() {
    const [accountModalOpen, setAccountModalOpen] = useState<boolean>(false)

    const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false)

    function toggleWalletModal(state: boolean) {
        setWalletModalOpen(state)

        if (state === false) {
            setAccountModalOpen(true)
        }
    }

    const { current: roomIds = [] } = useRef()

    return (
        <MessageTransmitter>
            <Page title="Let's chat!">
                <Nav onAccountClick={() => void setAccountModalOpen(true)} />
                <main
                    css={[
                        tw`
                            w-screen
                            h-screen
                            p-10
                            pt-[91px]
                        `,
                    ]}
                >
                    <div
                        css={[
                            tw`
                                w-full
                                h-full
                                relative
                            `,
                        ]}
                    >
                        <RoomList />
                        <Convo />
                    </div>
                </main>
            </Page>
            <AccountModal
                open={accountModalOpen}
                setOpen={setAccountModalOpen}
                onChangeClick={() => {
                    setAccountModalOpen(false)
                    setWalletModalOpen(true)
                }}
            />
            <WalletModal open={walletModalOpen} setOpen={toggleWalletModal} />
            {roomIds.map((id) => (
                <RoomNameLoader key={id} roomId={id} />
            ))}
            <InvitationListener />
        </MessageTransmitter>
    )
}

export default function Chat() {
    const account = useAccount()

    const navigate = useNavigate()

    useEffect(() => {
        if (account === null) {
            navigate('/')
        }
    }, [navigate, account])

    // No account? Render nothing and wait. The above `useEffect` will
    // take us places.
    if (!account) {
        return null
    }

    return <UnwrappedChat />
}

function MessageTransmitter(props: any) {
    return <Fragment {...props} />
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function RoomNameLoader(props: any) {
    return null
}

function InvitationListener() {
    return null
}

function RoomList() {
    return null
}

function Convo() {
    return null
}
