import React from 'react';
import { EditorState, Entity, KeyBindingUtil, AtomicBlockUtils, SelectionState, Modifier } from 'draft-js'
import styles from './styles.css';

import { insertContentLink, isActive } from './insertContentLink.js'

class ContentLinkButton extends React.Component {
    constructor(props) {
        super(props);

        this.isActive = this.isActive.bind(this)
        this.confirmContentLink = this._confirmContentLink.bind(this);

        this.state = {
            active: false,
        }
    }

    componentWillMount() {
        this.isActive(this.props)
    }

    _confirmContentLink() {
        this.props.setEditorState(insertContentLink(this.props.getEditorState(), {
            nodeId: this.props.nodeId,
            node: this.props.node,
            showAddRelationWindow: this.props.showAddRelationWindow,
            removeEdge: this.props.removeEdge,
        }))
    }

    isActive(props, cb) {
        this.setState({
            active: isActive(props.getEditorState())
        })
    }

    componentWillUpdate(nextProps) {
        this.isActive(nextProps)
    }

    render() {
        const className = [this.props.theme.button];
        if (this.state.active) {
            className.push(this.props.theme['button-active']);
        }

        return (
            <button className={className.join(' ')} onClick={this.confirmContentLink}>
                {this.props.label || "Link"}
            </button>
        );
    }
}

export default ContentLinkButton;
