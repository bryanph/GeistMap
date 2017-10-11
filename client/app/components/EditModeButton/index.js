import React from 'react';
import { connect } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react'
import classNames from 'classnames'

import { toggleAbstractEditMode } from '../../actions/ui'

import './styles.scss'

let EditModeButton = ({ mode, toggleAbstractEditMode }) => {
    const buttonClass = classNames("editModeButton", { editMode: mode === 'edit' })

    return (
        <Button 
            circular icon={ mode === 'edit' ? "checkmark" : "edit" } size="massive" className={ buttonClass }
            onClick={ toggleAbstractEditMode }
        />
    )
}

const mapStateToProps = (state) => ({
    mode: state.abstractGraphUiState.mode
})

export default connect(mapStateToProps, { toggleAbstractEditMode })(EditModeButton)


