import React from 'react'
import { connect } from 'react-redux'

import { Editor } from 'slate-react'
import { Block } from 'slate'
import { CHILD_REQUIRED, CHILD_TYPE_INVALID } from 'slate-schema-violations'

import SoftBreak from 'slate-soft-break'
import PasteLinkify from 'slate-paste-linkify'
import InsertImages from 'slate-drop-or-paste-images'
import CollapseOnEscape from 'slate-collapse-on-escape'
import AutoReplace from 'slate-auto-replace'
import EditBlockquote from 'slate-edit-blockquote'
import EditCode from 'slate-edit-code'
import EditList from 'slate-edit-list'
import LinkPlugin from './plugins/link'
import BoldPlugin from './plugins/bold'

import "./styles.scss"

const schema = {
    document: {
        nodes: [
            { types: ['title'], min: 1, max: 1 },
            { types: ['header', 'paragraph', 'blockquote', 'hr', 'ul', 'li', 'code_block', 'code_line', 'image'], min: 1 }
        ],
        normalize: (change, violation, { node, child, index }) => {
            switch (violation) {
                case CHILD_TYPE_INVALID: {
                    return change.setNodeByKey(
                        child.key,
                        index == 0 ? 'title' : 'paragraph'
                    )
                }
                case CHILD_REQUIRED: {
                    const block = Block.create(index === 0 ? 'title' : 'paragraph')
                    return change.insertNodeByKey(node.key, index, block)
                }
            }
        },
    },
    // blocks: {
    //     paragraph: {
    //         nodes: [{ objects: ['text'] }],
    //     },
    //     image: {
    //         isVoid: true,
    //         data: {
    //             src: v => v && isUrl(v),
    //         },
    //     },
    // },
}

const codePlugin = EditCode();

const plugins = [
    LinkPlugin({
        type: 'link',
        key: 'k',
    }),
    BoldPlugin({
        type: 'bold',
        key: 'b',
    }),
    SoftBreak({
        onlyIn: [ "code" ]
    }),
    SoftBreak({
        ignoreIn: [ "code" ],
        shift: true,
    }),
    PasteLinkify({
        type: 'link'
    }),
    InsertImages({
        extensions: ['png'],
        insertImage: (change, file) => {
            // TODO: perform an upload? - 2018-03-24
            // TODO: allow both local and uploaded image (ask for it?) - 2018-03-24
            return change.insertBlock({
                type: 'image',
                isVoid: true,
                data: { file }
            })
        }
    }),
    CollapseOnEscape(),

    AutoReplace({
        trigger: 'space',
        before: /^(-|\*)$/,
        transform: change => change.setBlock('li').wrapBlock('ul')
    }),
    AutoReplace({
        trigger: 'space',
        before: /^(#{1,5})$/,
        transform: (change, event, matches) => {
            const [ hashes ] = matches.before
            const level = hashes.length
            return change.setBlock({
                type: 'header',
                data: { level }
            })
        }
    }),
    AutoReplace({
        trigger: 'enter',
        before: /^(-{3})$/,
        transform: (change) => {
            return change.setBlock({
                type: 'hr',
                isVoid: true
            })
        }
    }),


    /*
     * Block quote
     */
    EditBlockquote({
        type: "blockquote"
    }),
    AutoReplace({
        trigger: 'space',
        before: /^(>)$/,
        transform: (change, e, matches) => {
            return change.setBlock({ type: 'blockquote' })
        }
    }),

    /*
     * Code block
     */
    codePlugin,
    AutoReplace({
        trigger: 'space',
        before: /^(```)([^\s]*)$/,
        transform: (change, e, matches) => {
            return codePlugin.changes.wrapCodeBlock(change)
        }
    }),

    /*
     * Lists
     */
    EditList(),
]

class ContentEditor extends React.Component {
    constructor(props) {
        super(props)

        // this.state = {
        //     value: initialValue
        // }

        this.onChange = this.onChange.bind(this);
        this.renderNode = this.renderNode.bind(this);
        this.renderMark = this.renderMark.bind(this);
    }

    onChange(change) {
        const { value } = change

        this.props.pushDelta(this.props.nodeId, change)

        // console.log(value.history.toJS())
        // console.log("operations", change.operations.toJS())
        // console.log(change.value.toJSON().document.nodes)

        // delay this, get it from props instead
        // this.setState({ value })
    }

    onSelect(event, change, editor) {
        // TODO: modify from here: https://github.com/ianstormtaylor/slate/blob/a3256963396364986ec91e9d0b4fe5b6a5497c4c/packages/slate-react/src/plugins/after.js#L516 - 2018-03-28
    }

    onKeyDown(event, change, editor) {
        // TODO: modify from here: https://github.com/ianstormtaylor/slate/blob/a3256963396364986ec91e9d0b4fe5b6a5497c4c/packages/slate-react/src/plugins/after.js#L365
    }

    render() {
        return (
            <Editor
                className="ContentEditor"
                plugins={plugins}
                schema={schema}
                value={this.props.value}
                onChange={this.onChange}
                renderNode={this.renderNode}
                renderMark={this.renderMark}
            />
        )
    }

    renderNode(props) {
        const { node, attributes, children } = props
        switch (node.type) {
            case 'title':
                return <h1 {...attributes}>{children}</h1>
            case 'paragraph':
                return <p {...attributes}>{children}</p>
            case 'blockquote':
                return <blockquote {...attributes}>{children}</blockquote>
            case 'hr':
                return <hr />
            case 'ul':
                return <ul {...attributes}>{children}</ul>
            case 'li':
                return <li {...attributes}>{children}</li>
            case 'header':
                const level = node.data.get('level')
                const Tag = `h${level+1}`
                return <Tag {...attributes}>{children}</Tag>
            case 'code_block':
                return (
                    <div className="code" {...attributes}>
                        {children}
                    </div>
                );
            case 'code_line':
                return <pre {...attributes}>{children}</pre>;
            case 'link': {
                const { data } = node
                const href = data.get('href')
                return (
                    <a {...attributes} href={href}>
                        {children}
                    </a>
                )
            }
        }
    }

    renderMark(props) {
        const { children, mark } = props
        switch (mark.type) {
            case 'bold':
                return <strong>{children}</strong>
            case 'code':
                return <code>{children}</code>
            case 'italic':
                return <em>{children}</em>
            case 'underlined':
                return <u>{children}</u>
        }
    }
}

import { pushDelta } from '../../actions/node'

function mapStateToProps(state) {
    return {
        value: state.slateState
    }
}

export default connect(mapStateToProps, {
    pushDelta
})(ContentEditor)
