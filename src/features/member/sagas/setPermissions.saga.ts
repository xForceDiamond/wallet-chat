import { Provider } from '@web3-react/types'
import { call, put, takeEvery } from 'redux-saga/effects'
import StreamrClient from 'streamr-client'
import { MemberAction } from '..'
import { Address } from '$/types'
import getWalletAccount from '$/sagas/getWalletAccount.saga'
import getWalletClient from '$/sagas/getWalletClient.saga'
import getWalletProvider from '$/sagas/getWalletProvider.saga'
import handleError from '$/utils/handleError'
import preflight from '$/utils/preflight'
import { MembersAction } from '../../members'
import { PermissionAction } from '../../permission'

export default function* setPermissions() {
    yield takeEvery(
        MemberAction.setPermissions,
        function* ({
            payload: { roomId, assignments },
        }: ReturnType<typeof MemberAction.setPermissions>) {
            try {
                const provider: Provider = yield call(getWalletProvider)

                const account: Address = yield call(getWalletAccount)

                yield preflight({
                    provider,
                    address: account,
                })

                const client: StreamrClient = yield call(getWalletClient)

                yield client.setPermissions({
                    streamId: roomId,
                    assignments,
                })

                yield put(MembersAction.detect(roomId))

                for (let i = 0; i < assignments.length; i++) {
                    yield put(
                        PermissionAction.invalidateAll({ roomId, address: assignments[i].user })
                    )
                }
            } catch (e) {
                handleError(e)
            }
        }
    )
}
