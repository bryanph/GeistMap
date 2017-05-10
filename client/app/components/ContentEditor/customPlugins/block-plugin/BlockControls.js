import React, { PropTypes } from 'react';
import { RichUtils, EditorState } from 'draft-js';
import styles from './styles.css';

export default (type) =>
  (props) =>
    <BlockControlButton
      label={props.label || type.label}
      style={type.style}
      theme={props.theme || styles}
      {...props}
    />;

class BlockControlButton extends React.Component {
  constructor(props) {
    super(props);

    this.isActive = this.isActive.bind(this)
    this.toggleBlockType = this.toggleBlockType.bind(this)

    this.state = {
        active: this.isActive(props)
    }
  }

  isActive(props) {
      const editorState = props.getEditorState();
      const selection = editorState.getSelection();

      const blockType = editorState
          .getCurrentContent()
          .getBlockForKey(selection.getStartKey() || selection.getAnchorKey())
          .getType();

      return props.style === blockType
  }

  toggleBlockType() {
    const nextState = RichUtils.toggleBlockType(
        this.props.getEditorState(),
        this.props.style,
    );

    this.props.setEditorState(
        EditorState.forceSelection(
            nextState, nextState.getCurrentContent().getSelectionAfter()
        )
    );

    // if (this.props.onToggle) {
    //     this.props.onToggle(this.isActive(this.props))
    // }
  }

  componentWillUpdate(nextProps) {
      const active = this.isActive(nextProps)

      if (active !== this.state.active) {
          this.setState({
              active
          })
      }
  }

  render() {
    const className = [this.props.theme.button];
    if (this.state.active) {
      className.push(this.props.theme['button-active']);
    }

    return (
      <button className={className.join(' ')} onClick={this.toggleBlockType}>
        {this.props.label}
      </button>
    );
  }
}
BlockControlButton.PropTypes = {
    style: PropTypes.string.isRequired, // internally assigned
    getEditorState: PropTypes.func.isRequired,
    setEditorState: PropTypes.func.isRequired,
    theme: PropTypes.object,
    onToggle: PropTypes.func,
}

