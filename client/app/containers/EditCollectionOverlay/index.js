import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { withRouter } from "react-router-dom"
import Portal from 'react-portal';

import './styles.scss'

import { Button, Header, Image, Modal } from 'semantic-ui-react'
import { Input } from 'semantic-ui-react'

class EditCollectionOverlay extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isOpen: false
        }
    }

    componentDidUpdate(nextProps) {
        if (this.props.editFocus !== nextProps.editFocus) {
            this.setState({ isOpen: true })
        }

    }

    render() {
        const { editFocus } = this.props

        return (
            <Portal closeOnEsc isOpened={this.state.isOpen} >
                <Modal open={!!editFocus.id} size={"small"} onClose={() => this.setState({ isOpen: false })} closeOnDocumentClick={true}>
                    <Modal.Header>Edit Subject</Modal.Header>
                    <Modal.Content>
                        <Image wrapped size='medium' src='/assets/images/avatar/large/rachel.png' />
                        <Modal.Description>
                            <Header>Default Profile Image</Header>
                            <p>We've found the following gravatar image associated with your e-mail address.</p>
                            <p>Is it okay to use this photo?</p>
                        </Modal.Description>
                    </Modal.Content>
                </Modal>
            </Portal>
        )
    }
}
EditCollectionOverlay.propTypes = {
    
}

function mapStateToProps(state) {
    return {
        editFocus: state.graphUiState.editFocus
    }
}

export default connect(mapStateToProps, {})(EditCollectionOverlay)
