import React from 'react';
import { connect } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react'
import classNames from 'classnames'

import './styles.scss'

class FocusButton extends React.Component {
    /*
     * On click, move graph in "selectNode" mode
    */
    constructor(props) {
        super(props)
    }

    render() {
        const { mode } = this.props

        const buttonClass = classNames("focusButton-button", {
            "active": mode === 'focus'
        })

        return (
            <Button 
                circular icon={ "crosshairs" } size="big" className={ buttonClass }
                onClick={ () => this.props.setGraphMode('focus') }
            />
        )
    }
}

import { setGraphMode } from '../../actions/ui'

export default connect((state) => ({ mode: state.graphUiState.mode }), {
    setGraphMode,
})(FocusButton)


