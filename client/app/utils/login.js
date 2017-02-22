
// TODO: better way for this? - 2016-03-22
export const isLoggedIn = function() {
    // no user object was attached to DOM on server render
    return window.user && window.user._id
}
