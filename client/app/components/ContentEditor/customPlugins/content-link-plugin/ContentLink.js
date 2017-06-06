import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom'
import { Entity, SelectionState, RichUtils } from 'draft-js';
import { EditButton, TrashButton } from '../../../../components/Buttons'

import { getSelectionEntity } from '../../utils/inline'

import path from 'path'

class ContentLink extends React.Component {

    constructor(props) {
        super(props)

        this.onNavigate = this.onNavigate.bind(this)
    }


    onNavigate(e) {
        // TODO: can this always be done? - 2017-06-01
        const { getReadOnly, hideInboxSidebar } = this.props

        if (getReadOnly()) {
            hideInboxSidebar()
        }
    }


    render() {
        const { history, getEditorState, setEditorState, getReadOnly } = this.props
        const { node, nodeId, edgeId } = this.props

        const readOnly = getReadOnly()

        const href = `/app/nodes/${nodeId}/edit`

        return (
            <Link to={ href } onClick={this.onNavigate} className="contentLink">
                {this.props.children}
                {
                    readOnly ? null :
                    <div className="contentLinkDiv" contenteditable="false">
                        <div className="contentLinkDiv-container">
                            { node && node.name }
                            <div className="contentLinkDiv-buttons">
                                <EditButton
                                    onTouchTap={() => history.push(href)}
                                />
                                <TrashButton
                                    label={"Remove"}
                                    onTouchTap={() => {
                                        // TODO: get selection here - 2016-10-20
                                        const entityKey = this.props.entityKey

                                        const blockKey = this.props.offsetKey.split('-')[0]
                                        const editorState = getEditorState()
                                        const contentState = editorState.getCurrentContent()
                                        const block = contentState.getBlockForKey(blockKey)

                                        let entityRange;
                                        block.findEntityRanges(
                                            (value) => {
                                                return value.getEntity() === entityKey
                                            },
                                            (start, end) => {
                                                entityRange = {
                                                    start,
                                                    end,
                                                    text: block.get('text').slice(start, end),
                                                }
                                            }
                                        )

                                        let selectionState = SelectionState.createEmpty(blockKey)
                                        selectionState = selectionState.merge({
                                            anchorKey: blockKey,
                                            focusKey: blockKey,
                                            anchorOffset: entityRange.start,
                                            focusOffset: entityRange.end,
                                        })

                                        setEditorState(
                                            RichUtils.toggleLink(editorState, selectionState, null)
                                        )
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                }
            </Link>
        );
    }
}
ContentLink.propTypes = {

}

import { removeEdge } from '../.././../../actions/async'
import { hideInboxSidebar } from '../.././../../actions/ui'
import { getNode } from '../.././../../reducers'

// TODO: shouldn't connect here - 2017-06-01
function mapStateToProps(state, props) {
    const { nodeId, edgeId } = Entity.get(props.entityKey).getData();

    return {
        nodeId,
        edgeId,
        node: getNode(state, nodeId)
    }

}

export default connect(mapStateToProps, {
    removeEdge,
    hideInboxSidebar,
})(withRouter(ContentLink));
