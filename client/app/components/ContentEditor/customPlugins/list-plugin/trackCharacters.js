/**
 * A mapping of keycodes to output characters that relate to list making
 * @type {Object}
 */
const characterMapping = {
    106: '*',
    110: '.',
    189: '-',
    190: '.',
    'shift': {
        56: '*',
        221: '*',
        190: '.',
    },
}

/**
 * Track the characters generated from keyboard input
 * @param  {Array} history List of (max 3) characters
 * @param  {KeyDownEvent} e Synthetic keyboard event from draftjs' `keyBindingFn`
 * @return {Array} The adjusted history
 */
function trackCharacters (history = [], e) {
    const {keyCode, shiftKey} = e

    // Keep history to <= 3 items because we only need that much to determine
    // whether a list is being indicated
    if (history.length > 2) {
        history = history.slice(1)
    } else {
        history = history.slice()
    }

    // Map the keyCodes to characters we care about
    let character = (shiftKey) ? characterMapping.shift[keyCode] : characterMapping[keyCode]
    if (!character) {
        character = String.fromCharCode(keyCode)
    }
    history.push(character)
    return history
}

export default trackCharacters
