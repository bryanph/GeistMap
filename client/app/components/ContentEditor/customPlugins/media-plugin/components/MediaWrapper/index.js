import React from 'react';
import { connect } from 'react-redux'
import {EditorState, SelectionState, Modifier} from "draft-js";
import classNames from 'classnames'
 
import BlockContent from '../BlockContent.js'
import BlockData from '../BlockData.js'
import BlockInput from '../BlockInput.js'
import CommonBlock from '../CommonBlock.js'

import DeleteIcon from 'material-ui/svg-icons/action/delete';

import './styles.css'
import './dropdown.scss'
import './media.scss'
import './block.scss'

// TODO: pass this down instead - 2017-08-25
import { removeFile } from '../../../../../../actions/file'

const styles = {
    media: {
        width: '100%'
    },
    iframeWrapper: {
        // position: 'relative',
        width: '100%',
        // height: '100%',
    },
    iframe: {
            // position: 'absolute',
            // height: '100%',
        }
}

const injectProps = (Component) => {
    return (props) => {
        // TODO: use immutables? - 2016-11-18
        const data = props.block.getData().toJS()

        const { src, type } = data

        return <Component src={src} data={data} />
    }
}


export function wrapMedia(Component) {
    class MediaWrapper extends React.Component {
        constructor(props) {
            super(props)

            this.remove = this.remove.bind(this);
            this.updateData = this.updateData.bind(this);

            this.setEditorState = this.props.blockProps.setEditorState

            this._handleFocus = this._handleFocus.bind(this);
            this._handleBlur = this._handleBlur.bind(this);
        }

        remove() {
            const { blockProps } = this.props
            const editorState = blockProps.getEditorState();
            const selection = editorState.getSelection();
            const content = editorState.getCurrentContent();
            const keyAfter = content.getKeyAfter(this.props.block.key);
            const blockData = content.getBlockMap().get(this.props.block.key).getData()
            const blockMap = content.getBlockMap().delete(this.props.block.key);
            const withoutAtomicBlock = content.merge({
                blockMap, selectionAfter: selection
            });
            const newState = EditorState.push(
                editorState, withoutAtomicBlock, "remove-range"
            );
            const newSelection = new SelectionState({
                anchorKey: keyAfter,
                anchorOffset: 0,
                focusKey: keyAfter,
                focusOffset: this.props.block.getLength()
            });
            const newEditorState = EditorState.forceSelection(newState, newSelection);
            this.setEditorState(newEditorState);

            // TODO: remove on server? - 2016-11-23
            // if (blockData.get('uploaded')) {
            //     this.props.removeFile(blockData.get('file').filename)
            // }
            

        }

        updateData(data) {
            const editorState = this.props.blockProps.getEditorState();
            const content = editorState.getCurrentContent();
            const selection = new SelectionState({
                anchorKey: this.props.block.key,
                anchorOffset: 0,
                focusKey: this.props.block.key,
                focusOffset: this.props.block.getLength()
            });

            const newContentState = Modifier.mergeBlockData(content, selection, data);
            const newEditorState =  EditorState.push(editorState, newContentState);

            this.setEditorState(newEditorState);
        }

        _handleFocus() {
            this.props.blockProps.setReadOnly(true);
        }

        _handleBlur() {
            this.props.blockProps.setReadOnly(false);
        }

        _getDisplay(display) {
            if (display === 'small') {
                return 'media-small'
            }
            else if (display === 'big') {
                return 'media-big'
            }
            else { // medium
                return 'media-medium'
            }
        }

        _getAlignment(key) {
            switch(key) {
                case 'left':
                    return 'media-left-align'
                case 'right':
                    return 'media-right-align'
                default: 
                    return 'media-center-align'
            }
        }

        render() {
            // Should we use immutables?
            const data = this.props.block.getData().toJS();
            const {setReadOnly} = this.props.blockProps;
            // const Block = plugin.blockComponent;

            const wrapperClasses = classNames(
                'media-wrapper',
                this._getDisplay(data.display),
                this._getAlignment(data.align),
            )

            return (
                <div className={wrapperClasses}>
                    <div onBlur={this._handleBlur} onFocus={this._handleFocus}>
                        <Component data={data} container={this} blockProps={this.props.blockProps} />
                    </div>
                </div>
            );
        }
    }

    return connect(null, { removeFile })(MediaWrapper)
}

// TODO: allow custom components to be passed for this - 2016-08-03
export const Audio = injectProps((props) => {
    return <audio controls src={props.src} style={styles.media} />;
})
export const Image = injectProps((props) => {
    return <img src={props.src} style={styles.media} />;
})
export const Video = injectProps((props) => {
    return <video controls src={props.src} style={styles.media} />;
})
export const Youtube = injectProps((props) => {
    return (
        <div style={styles.iframeWrapper}>
            <iframe src={props.src} style={styles.iframe}/>
        </div>
    )
})

