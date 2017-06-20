import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from "react-router-dom"
import Portal from 'react-portal';

import { Button, Modal } from 'semantic-ui-react'

import './styles.scss'

class EditCollectionOverlay extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { editFocus } = this.props

        return null;

        return (
            <Portal closeOnEsc closeOnOutsideClick isOpened={!!editFocus.id}>
                <div className='editCollectionOverlay'>
                    <div className="editCollectionOverlay-text">
                        
                    </div>
                </div>
            </Portal>
        )
    }
}

function mapStateToProps(state) {
    return {
        editFocus: state.graphUiState.editFocus
    }
}

export default connect(mapStateToProps, {})(EditCollectionOverlay)
