/**
 *
 * ContentEditorToolbar
 *
 */

import React from 'react';
import { connect } from 'react-redux'

import classNames from 'classnames'

// import { H1Button, H2Button, H3Button, H4Button, H5Button, H6Button, BlockquoteButton, UlButton, OlButton, CodeblockButton } from 'draft-js-block-plugin'
import { H1Button, H2Button, H3Button, H4Button, H5Button, H6Button, BlockquoteButton, UlButton, OlButton, CodeblockButton } from '../ContentEditor/customPlugins/block-plugin'
import { AddMediaButton } from '../ContentEditor/customPlugins/media-plugin'
import { InsertTeXButton, InsertInlineTeXButton } from '../ContentEditor/customPlugins/latex-plugin'

const blockTheme = {
    'button': 'ContentEditor-blockButton',
    'button-active': 'ContentEditor-blockButtonActive'
}
const blockHeaderTheme = {
    'button': 'ContentEditor-blockButton ContentEditor-headerButton',
    'button-active': 'ContentEditor-blockButtonActive ContentEditor-headerButtonActive'
}

const iconStyle = {
    height: '2rem',
    width: '2rem',
    verticalAlign: 'middle',
}

const texIconStyle = {
    height: '1.3rem',
    width: '2.2rem',
    verticalAlign: 'middle',
}

const blockTexIconStyle = {
    height: '1.5rem',
    width: '3rem',
    verticalAlign: 'middle',
}

import EditorQuote from 'material-ui/svg-icons/editor/format-quote';
import EditorInsertPhoto from 'material-ui/svg-icons/editor/insert-photo';
import EditorCamcorder from 'material-ui/svg-icons/av/videocam';
import EditorAudio from 'material-ui/svg-icons/image/audiotrack';
import EditorUnorderedList from 'material-ui/svg-icons/editor/format-list-bulleted';
import EditorOrderedList from 'material-ui/svg-icons/editor/format-list-numbered';
import EditorAttachFile from 'material-ui/svg-icons/editor/attach-file';
import EditorLink from 'material-ui/svg-icons/editor/insert-link';
import EditorCode from 'material-ui/svg-icons/action/code';
import EditorFunctions from 'material-ui/svg-icons/editor/functions';

const TexIcon = (props) => <img src="/static/TeX_logo.svg" style={ texIconStyle } />
    const TexIcon2 = (props) => <img src="/static/TeX_logo2.svg" style={ blockTexIconStyle } />

    const IconButton = (props) => {
        const { theme, label, ...rest } = props

        return (
            <button className={theme.button} {...rest}>
                { props.label }
            </button>
        )
    }

import { showAddPictureWindow } from '../../actions/ui'
const AddPictureButton = connect(null, { showAddPictureWindow })((props) => {
    return (
        <IconButton
            theme={blockTheme}
            label={
                <EditorInsertPhoto 
                    style={iconStyle} 
                    hoverColor={'#5890ff'}
                />}
                onClick={() => props.showAddPictureWindow()}
            />
    )
})
import { showAddVideoWindow } from '../../actions/ui'
const AddVideoButton = connect(null, { showAddVideoWindow })((props) => {
    return (
        <IconButton
            theme={blockTheme}
            label={
                <EditorCamcorder 
                    style={iconStyle} 
                    hoverColor={'#5890ff'}
                />}
                onClick={() => props.showAddVideoWindow()}
            />
    )
})
import { showAddAudioWindow } from '../../actions/ui'
const AddAudioButton = connect(null, { showAddAudioWindow })((props) => {
    return (
        <IconButton
            theme={blockTheme}
            label={
                <EditorAudio 
                    style={iconStyle} 
                    hoverColor={'#5890ff'}
                />}
                onClick={() => props.showAddAudioWindow()}
            />
    )
})

class ContentEditorToolbar extends React.Component {

    constructor(props) {
        super(props)

        this.determinePosition = this.determinePosition.bind(this)

        this.state = {
            fixed: false,
        }
    }

    determinePosition(e) {
        const distanceY = window.scrollY;
        this.setState({
            fixed: distanceY > 180
        })
    }

    componentDidMount() {
        window.addEventListener('scroll', this.determinePosition)
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.determinePosition)
    }

    render() {
        const { getEditorState, setEditorState } = this.props

        const toolbarClass = classNames('ContentEditor-toolbar', {
            fixed: this.state.fixed
        })

        return (
            [
                <div className={ toolbarClass }>
                    <div className={'ContentEditor-group'}>
                        <H3Button getEditorState={getEditorState} setEditorState={setEditorState} 
                            theme={blockHeaderTheme}
                            label={'H1'}
                        />
                        <H4Button getEditorState={getEditorState} setEditorState={setEditorState}
                            theme={blockHeaderTheme}
                            label={'H2'}
                        />
                        <H5Button getEditorState={getEditorState} setEditorState={setEditorState}
                            theme={blockHeaderTheme}
                            label={'H3'}
                        />
                    </div>
                    <div className={'ContentEditor-group'}>
                        <BlockquoteButton getEditorState={getEditorState} setEditorState={setEditorState}
                            theme={blockTheme}
                            label={
                                <EditorQuote 
                                    style={iconStyle} 
                                    hoverColor={'#5890ff'}
                                />}
                            />
                            <CodeblockButton getEditorState={getEditorState} setEditorState={setEditorState} 
                                theme={blockTheme}
                                label={
                                    <EditorCode 
                                        style={iconStyle} 
                                        hoverColor={'#5890ff'}
                                    />}
                                />
                            </div>
                            <div className={'ContentEditor-group'}>
                                <UlButton getEditorState={getEditorState} setEditorState={setEditorState}
                                    theme={blockTheme}
                                    label={
                                        <EditorUnorderedList 
                                            style={iconStyle} 
                                            hoverColor={'#5890ff'}
                                        />}
                                    />
                                    <OlButton getEditorState={getEditorState} setEditorState={setEditorState}
                                        theme={blockTheme}
                                        label={
                                            <EditorOrderedList 
                                                style={iconStyle} 
                                                hoverColor={'#5890ff'}
                                            />}
                                        />
                                    </div>
                                    <div className={'ContentEditor-group'}>
                                        {
                                            /*
                    <AddMediaButton editorState={getEditorState()} setEditorState={setEditorState}
                        label={
                            <EditorAttachFile 
                                style={iconStyle} 
                                hoverColor={'#5890ff'}
                        />}
                    />
                    */
                                        }
                                        <AddPictureButton />
                                        <AddVideoButton />
                                        <AddAudioButton />
                                    </div>
                                    <div className={'ContentEditor-group'}>
                                        <InsertInlineTeXButton editorState={getEditorState()} setEditorState={setEditorState}
                                            setReadOnly={this.props.setReadOnly}
                                            label={<TexIcon />}
                                        />
                                        <InsertTeXButton editorState={getEditorState()} setEditorState={setEditorState}
                                            setReadOnly={this.props.setReadOnly}
                                            label={<TexIcon2 />}
                                        />
                                    </div>
                                </div>
            ]
        );
    }
}

export default ContentEditorToolbar;
