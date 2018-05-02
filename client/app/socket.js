/*
 * main socket connection
*/

import io from 'socket.io-client'
import withProps from 'recompose/withProps'
import { wrapPromise } from './utils/promise.js'

const _socket = io('/');
_socket.emit = wrapPromise(_socket.emit.bind(_socket))
// _socket.on = wrapPromise(_socket.on.bind(_socket))

export const withSocket = withProps({ socket: _socket })

export default _socket

export const SOCKET_CONNECT = "SOCKET_CONNECT"
export const SOCKET_DISCONNECT = "SOCKET_DISCONNECT"
export const SOCKET_RECONNECT = "SOCKET_RECONNECT"

export const wrapSocketEvents = function(store) {
    /*
     * dispatches the following actions to the reducer:
     * - SOCKET_CONNECT
     * - SOCKET_DISCONNECT
     * - SOCKET_RECONNECT
    */

    _socket.on('connect', function() {
        store.dispatch({ type: SOCKET_CONNECT })
    })

    _socket.on('disconnect', function() {
        store.dispatch({ type: SOCKET_DISCONNECT })
    })

    _socket.on('reconnect', function() {
        store.dispatch({ type: SOCKET_RECONNECT })
    })
}

