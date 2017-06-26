import React from 'react';
import { connect } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react'
import classNames from 'classnames'

import { toggleEditMode } from '../../actions/ui'

import './styles.scss'

let EditModeButton = ({ mode, toggleEditMode }) => {
    const buttonClass = classNames("editModeButton", { editMode: mode === 'edit' })

    return (
        <Button 
            circular icon={ mode === 'edit' ? "checkmark" : "edit" } size="massive" className={ buttonClass }
            onClick={ toggleEditMode }
        />
    )
}

const mapStateToProps = (state) => ({
    mode: state.graphUiState.mode
})

export default connect(mapStateToProps, { toggleEditMode })(EditModeButton)


