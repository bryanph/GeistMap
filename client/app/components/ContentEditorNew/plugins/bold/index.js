export default function Bold(options) {
    const { type, key } = options

    function addBoldMark(change) {
        change.toggleMark(type)
    }

    const onKeyDown = (event, change) => {
        if (!event.ctrlKey || event.key != key) return

        event.preventDefault()

        change.call(addBoldMark)

        return true
    }


    return {
        // changes: {
        //     addBoldMark,
        //     removeBoldMark,
        //     toggleBoldMark,
        // },
        // components: {
        //     BoldMark,
        //     BoldButton,
        // },
        // helpers: {
        //     hasBoldMark,
        // },
        // plugins: [
        //     Hotkey('cmd+b', addBoldMark),
        //     RenderMark('bold', props => <BoldMark {...props} />),
        //     RenderButton(props => <BoldButton {...props} />),
        // ]
        onKeyDown,
    }
}
