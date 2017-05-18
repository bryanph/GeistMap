import {EditorState, Modifier, RichUtils, SelectionState} from 'draft-js'
import trackCharacters from './trackCharacters'

/**
 * Regexes for matching list unordered/ordered types.
 * Split into two since we're sometimes matching with the space at the end
 *
 * Unordered lists should match either '* ' or '- '
 * Ordered lists should match any `${digit}. `, so '1. ', '3. ', 222. ' should
 * all work.
 *
 * @type {RegExp}
 */
const UL_FULL_REGEX = /^(\*|\-)\s$/
const UL_INTERCEPT_REGEX = /^(\*|\-)$/
const OL_FULL_REGEX = /^\d+\.\s$/
const OL_INTERCEPT_REGEX = /^\d+\.$/

/**
 * The autolist namespaced commands
 * @type {Object}
 */
const commands = {
    OL: 'autolist-ordered',
    UL: 'autolist-unordered',
}

const blockTypes = {
    UL: 'unordered-list-item',
    OL: 'ordered-list-item',
    UNSTYLED: 'unstyled',
}

/**
 * Auto-list Plugin
 *
 * Infers that the user is trying to write a list of things and turns the
 * current block into either an ordered or unordered list.
 *
 * We do this by tracking the characters typed and, when a matching sequence
 * is entered, then attempting to turn it into the correct list type.
 *
 * This approach is not fool-proof: if you make a mistake while typing a list
 * and have to delete it we’ll fail to infer that correctly. This is somewhat
 * intentional as we don't want to have to query the content of the editor
 * for every single keyDown.
 *
 * @return {Object} Object defining the draft-js API methods
 */
function autoListPlugin () {
    let keyCharsHistory = []

    return {

        /**
         * Listen to all keyboard events, intercept and return a custom command
         * if the sequence of typed characters matches the criteria for creating
         * a unordered or ordered list.
         *
         * @param  {KeyboardEvent} e Synthetic keyboard event from draftjs
         * @return {String} A command, either our custom ones or one of the defaults
         */
        keyBindingFn (e) {
            keyCharsHistory = trackCharacters(keyCharsHistory, e)

            // Only run our more complex checks if the last character
            // typed is a space
            if (e.keyCode === 32) {
                // Test the last two characters to see if they match the full unordered
                // list regex
                const lastTwoChars = keyCharsHistory.slice(-2).join('')
                if (UL_FULL_REGEX.test(lastTwoChars)) {
                    return commands.UL
                    // Test the all the characters to see if they match the full ordered
                    // list regex
                } else if (OL_FULL_REGEX.test(keyCharsHistory.join(''))) {
                    return commands.OL
                }
            }
        },

        /**
         * Listen to the when a return is typed, and remove an empty list item.
         * Means that lists act as you’d expect while typing.
         *
         * @param  {KeyboardEvent} e Synthetic keyboard event from draftjs
         * @param  {Function} options.getEditorState Getter function passed by
         * the draft-js-plugin-editor
         * @param  {Function} options.setEditorState Setter function passed by
         * the draft-js-plugin-editor
         * @return {Boolean} Did we handle the return or not?
         */
        handleReturn (e, editorState, { setEditorState }) {
            let content = editorState.getCurrentContent()

            // Retrieve current block
            const selection = editorState.getSelection()
            const blockKey = selection.getStartKey()
            let block = content.getBlockForKey(blockKey)
            const blockType = block.getType()

            // If it’s a list-item and it’s empty, toggle its blockType (which should
            // make it 'unstyled')
            if (/list-item/.test(blockType) && block.getText() === '') {
                editorState = RichUtils.toggleBlockType(editorState, blockType)
                content = editorState.getCurrentContent()
                editorState = EditorState.forceSelection(editorState, content.getSelectionAfter())
                setEditorState(editorState)
                return 'handled'
            }
            return 'not-handled'
        },

        /**
         * Handle our custom `commands`
         * @param  {[type]} command                [description]
         * @param  {[type]} options.setEditorState [description]
         * @return {[type]}                        [description]
         */
        handleKeyCommand (command, editorState, { setEditorState }) {
            if (command === commands.UL || command === commands.OL) {
                // Set up the base types/checks
                let listType = blockTypes.UL
                let listTest = (text) => UL_INTERCEPT_REGEX.test(text)
                if (command === commands.OL) {
                    listType = blockTypes.OL
                    listTest = (text) => OL_INTERCEPT_REGEX.test(text)
                }

                let content = editorState.getCurrentContent()

                // Retrieve the focused block
                const selection = editorState.getSelection()
                const blockKey = selection.getStartKey()
                let block = content.getBlockForKey(blockKey)

                // Check if it matches our criteria for creating a list: unstyled, at
                // the top-level and empty.
                let blockText = block.getText()
                if (block.getType() === blockTypes.UNSTYLED && block.getDepth() === 0 && listTest(blockText)) {
                    // Convert the existing block to an unordered list
                    editorState = RichUtils.toggleBlockType(editorState, listType)
                    content = editorState.getCurrentContent()
                    block = content.getBlockForKey(blockKey)

                    // Select the entire block
                    const blockSelection = new SelectionState({
                        anchorKey: blockKey,
                        anchorOffset: 0,
                        focusKey: blockKey,
                        focusOffset: block.getLength(),
                    })

                    // Replace with the text with either nothing (if we created a list)
                    // or the existing content
                    content = Modifier.replaceText(
                        content,
                        blockSelection,
                        ''
                    )
                } else {
                    // We’ve intercepted the normal keyboard command propagation here, so
                    // we needs to manually insert a space if we're not injecting a list
                    content = Modifier.insertText(
                        content,
                        selection,
                        ' '
                    )
                }
                // Propagate the new state up
                editorState = EditorState.push(editorState, content)
                editorState = EditorState.forceSelection(editorState, content.getSelectionAfter())
                setEditorState(editorState)
                return 'handled'
            }
            return 'not-handled'
        },
    }
}

export default autoListPlugin
