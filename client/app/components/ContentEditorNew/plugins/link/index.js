import { getEventTransfer } from 'slate-react'
import isUrl from 'is-url'

const hasLinks = (change) => {
    const { value } = change
    return value.inlines.some(inline => inline.type == 'link')
}

export default function LinkPlugin(options) {
    const { type, key } = options

    function wrapLink(change, href) {
        change.wrapInline({
            type,
            data: { href },
        })

        change.collapseToEnd()
    }

    function unwrapLink(change) {
        change.unwrapInline(type)
    }

    const toggleLink = (change) => {
        const { value } = change

        if (hasLinks(change)) {
            change.call(unwrapLink)
        } else if (value.isExpanded) {
            const href = window.prompt('Enter the URL of the link:')
            change.call(wrapLink, href)
        } else {
            const href = window.prompt('Enter the URL of the link:')
            const text = window.prompt('Enter the text for the link:')
            change
                .insertText(text)
                .extend(0 - text.length)
                .call(wrapLink, href)
        }
    }

    // const onClickLink = event => {
    //     /*
    //      * When clicking on the button
    //     */
    //     event.preventDefault()
    //     const { value } = this.state
    //     const hasLinks = this.hasLinks()
    //     const change = value.change()

    //     if (hasLinks) {
    //         change.call(unwrapLink)
    //     } else if (value.isExpanded) {
    //         const href = window.prompt('Enter the URL of the link:')
    //         change.call(wrapLink, href)
    //     } else {
    //         const href = window.prompt('Enter the URL of the link:')
    //         const text = window.prompt('Enter the text for the link:')
    //         change
    //             .insertText(text)
    //             .extend(0 - text.length)
    //             .call(wrapLink, href)
    //     }

    //     this.onChange(change)
    // }

    const onKeyDown = (event, change) => {
        if (!event.ctrlKey || event.key != key) return

        event.preventDefault()

        change.call(toggleLink)

        return true
    }

    const onPaste = (event, change) => {
        if (change.value.isCollapsed) return

        const transfer = getEventTransfer(event)
        const { type, text } = transfer
        if (type != 'text' && type != 'html') return
        if (!isUrl(text)) return

        if (hasLinks(change)) {
            change.call(unwrapLink)
        }

        change.call(wrapLink, text)
        return true
    }

    return {
        // Return properties that describe your logic here...
        onKeyDown: onKeyDown,
        onPaste: onPaste,
    }
}
