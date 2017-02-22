
import React, { PropTypes } from 'react';
import { RichUtils, EditorState } from 'draft-js';
import styles from './styles.css';

export default (type) =>
  (props) =>
    <InlineControlButton
      label={props.label || type.label}
      style={type.style}
      theme={props.theme || styles}
      {...props}
    />;

class InlineControlButton extends React.Component {
  constructor(props) {
    super(props);

    this.isActive = this.isActive.bind(this)
    this.toggleInlineType = this.toggleInlineType.bind(this)

    this.state = {
        active: this.isActive(props)
    }
  }

  isActive(props) {
      const editorState = props.getEditorState();
      return editorState.getCurrentInlineStyle().has(this.props.style);
  }

  toggleInlineType() {
    const nextState = RichUtils.toggleInlineStyle(
      this.props.getEditorState(),
      this.props.style,
    );

    this.props.setEditorState(
        EditorState.forceSelection(
            nextState, nextState.getCurrentContent().getSelectionAfter()
        )
    );

    if (this.props.onToggle) {
        this.props.onToggle(this.isActive(this.props))
    }
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
      <button className={className.join(' ')} onClick={this.toggleInlineType}>
        {this.props.label}
      </button>
    );
  }
}
InlineControlButton.PropTypes = {
    style: PropTypes.string.isRequired, // internally assigned
    getEditorState: PropTypes.func.isRequired,
    setEditorState: PropTypes.func.isRequired,
    theme: PropTypes.object,
    onToggle: PropTypes.func,
}

