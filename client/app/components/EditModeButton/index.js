import React from 'react';
import { connect } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react'
import classNames from 'classnames'

import { toggleEditMode } from '../../actions/ui'

import './styles.scss'

let EditModeButton = ({ editMode, toggleEditMode }) => {
    const buttonClass = classNames("editModeButton", { editMode: editMode })

    return (
        <Button 
            circular icon={ editMode ? "checkmark" : "edit" } size="massive" className={ buttonClass }
            onClick={ toggleEditMode }
        />
    )
}

const mapStateToProps = (state) => ({
    editMode: state.uiState.editMode.active 
})

export default connect(mapStateToProps, { toggleEditMode })(EditModeButton)


