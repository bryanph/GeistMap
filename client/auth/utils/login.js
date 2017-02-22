import _ from 'lodash'

export const isLoggedIn = function(state) {
    return state.user && !_.isEmpty(state.user)
}
