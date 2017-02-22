import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router'
import { Entity, SelectionState, RichUtils } from 'draft-js';
import { EditButton, TrashButton } from '../../../../components/Buttons'

import { getSelectionEntity } from 'draftjs-utils'

import path from 'path'

class Link extends React.Component {
    constructor(props) {
        super(props)
    }


    render() {
        const { router, getEditorState, setEditorState } = this.props
        const { node, nodeId, edgeId } = Entity.get(this.props.entityKey).getData();
        // TODO: instead, get actual node and edge here - 2016-10-20

        const href = path.resolve(window.location.pathname, `../../${nodeId}/edit`)

        // console.log(this.props);
        // const selection = getEditorState().getSelection()
        // console.log(getEditorState().getSelection().serialize());
        // console.log(selection);
        //
        // console.log(node);

        return (
            <a href={href} target="_blank" className="contentLink">
                {this.props.children}
                <div className="contentLinkDiv" contenteditable="false">
                    <div className="contentLinkDiv-container">
                        { node.properties && node.properties.name || node._source.title }
                        <div className="contentLinkDiv-buttons">
                            <EditButton
                                onTouchTap={() => router.push(href)}
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

export default connect(null, { removeEdge })(withRouter(Link));
