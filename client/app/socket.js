/*
 * main socket connection
*/

import io from 'socket.io-client'

const _socket = io('/');

export const withSocket = withProps({ socket: _socket })

export default _socket

