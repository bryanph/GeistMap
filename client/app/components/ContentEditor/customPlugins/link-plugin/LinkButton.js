import React from 'react';
import { EditorState, Entity, KeyBindingUtil, AtomicBlockUtils, SelectionState, Modifier } from 'draft-js'
import styles from './styles.css';

import { insertLink, isActive } from './insertLink.js'

class LinkButton extends React.Component {
    constructor(props) {
        super(props);

        this.isActive = this.isActive.bind(this)
        this.confirmLink = this._confirmLink.bind(this);

        this.state = {
            active: false,
        }
    }

    componentWillMount() {
        this.isActive(this.props)
    }

    _confirmLink() {
        this.props.setEditorState(insertLink(this.props.getEditorState()))
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
            <button className={className.join(' ')} onClick={this.confirmLink}>
                {this.props.label || "Link"}
            </button>
        );
    }
}

export default LinkButton;
