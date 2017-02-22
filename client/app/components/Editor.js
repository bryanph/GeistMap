import _ from 'lodash'
import React, { PropTypes } from 'react'

export const Editor = React.createClass({

    propTypes: {
        
    },

    getInitialState: function() {
        return {
            editorState: EditorState.createEmpty()
        }
    },

    onChange: function(editorState) {
        this.setState(editorState)
    },

    render: function() {
        return (
            <Editor
                editorState={editorState}
                onChange={this.onChange}
            />
        )
    }
})

export default Editor
