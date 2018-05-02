
import {
    SOCKET_CONNECT,
    SOCKET_DISCONNECT
} from '../socket'

const initialState = {
    isInitial: true,
    connected: false,
};

function socketStateReducer(state=initialState, action) {
    switch(action.type) {
        case SOCKET_CONNECT:
            return {
                ...state,
                isInitial: false,
                connected: true,
            }
        case SOCKET_DISCONNECT:
            return {
                ...state,
                connected: false,
            }
        default:
            return state;
    }
}

export function isDisconnected(state) {
    return !state.socketState.connected
}

export default socketStateReducer

