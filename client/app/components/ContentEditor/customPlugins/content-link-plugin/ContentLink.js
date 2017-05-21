import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import { Entity, SelectionState, RichUtils } from 'draft-js';
import { EditButton, TrashButton } from '../../../../components/Buttons'

import { getSelectionEntity } from '../../utils/inline'

import path from 'path'

class Link extends React.Component {
    constructor(props) {
        super(props)
    }


    render() {
        const { history, getEditorState, setEditorState } = this.props
        const { nodeId, edgeId } = this.props

        const href = path.resolve(window.location.pathname, `../../${nodeId}/edit`)
        const node = this.props.node

        return (
            <a href={href} target="_blank" className="contentLink">
                {this.props.children}
                <div className="contentLinkDiv" contenteditable="false">
                    <div className="contentLinkDiv-container">
                        { node && node.properties && node.properties.name }
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
            </a>
        );
    }
}
Link.propTypes = {

}

import { removeEdge } from '../.././../../actions/async'
import { getNode } from '../.././../../reducers'

function mapStateToProps(state, props) {
    // get the node associated with this link to display its title

    const { nodeId, edgeId } = Entity.get(props.entityKey).getData();

    return {
        nodeId,
        edgeId,
        node: getNode(state, nodeId)
    }

}

export default connect(mapStateToProps, { removeEdge })(withRouter(Link));
