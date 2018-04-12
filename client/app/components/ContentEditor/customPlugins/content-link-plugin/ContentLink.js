import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom'
import { Entity, SelectionState, RichUtils } from 'draft-js';
import { FlatButton } from '../../../../components/button'

import { getSelectionEntity } from '../../utils/inline'

import path from 'path'
import QueryLink from 'QueryLink'

class ContentLink extends React.Component {

    constructor(props) {
        super(props)

        this.onNavigate = this.onNavigate.bind(this)
    }


    onNavigate(e) {
        // TODO: can this always be done? - 2017-06-01
        const { getReadOnly, hideArchiveSidebar } = this.props

        if (getReadOnly()) {
            hideArchiveSidebar()
        }
    }


    render() {
        const { history, getEditorState, setEditorState, getReadOnly } = this.props
        const { node, nodeId, edgeId } = this.props

        const readOnly = getReadOnly()

        return (
            <QueryLink to={ `/app/nodes/${nodeId}/graph` } onClick={this.onNavigate} className="contentLink">
                {this.props.children}
                {
                    readOnly ? null :
                    <div className="contentLinkDiv">
                        <div className="contentLinkDiv-container">
                            <span className="contentLinkDiv-title">{ node && node.name }</span>
                            <div className="contentLinkDiv-buttons">
                                <FlatButton
                                    onClick={() => {
                                            history.push({
                                                pathname: `/app/nodes/${nodeId}/graph`,
                                                search: this.props.location.search
                                            })}
                                    }
                                    iconName="edit"
                                >Edit</FlatButton>

                                <FlatButton
                                    iconName="trash"
                                    onClick={() => {
                                        console.log("is this being called?")
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
                                >Remove</FlatButton>
                            </div>
                        </div>
                    </div>
                }
            </QueryLink>
        );
    }
}

import { removeEdge } from '../.././../../actions/node'
import { hideArchiveSidebar } from '../.././../../actions/ui'
import { getNode } from '../.././../../reducers'

// TODO: shouldn't connect here - 2017-06-01
function mapStateToProps(state, props) {
    const editorState = props.getEditorState()
    const { nodeId, edgeId } = editorState.getCurrentContent().getEntity(props.entityKey).getData();

    return {
        nodeId,
        edgeId,
        node: getNode(state, nodeId)
    }

}

export default connect(mapStateToProps, {
    removeEdge,
    hideArchiveSidebar,
})(withRouter(ContentLink));
