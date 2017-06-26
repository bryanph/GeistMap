import React from 'react';
import { connect } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react'
import classNames from 'classnames'

import './styles.scss'

class FetchNodeButton extends React.Component {
    /*
     * On click, move graph in "selectNode" mode
    */
    constructor(props) {
        super(props)
    }

    render() {
        const { mode } = this.props

        const buttonClass = classNames("fetchNodeButton-button", {
            "active": mode === 'fetch'
        })

        return (
            <Button 
                circular icon={ "expand" } size="big" className={ buttonClass }
                onClick={ () => this.props.setGraphMode('fetch') }
            />
        )
    }
}

import { setGraphMode } from '../../actions/ui'

export default connect((state) => ({ mode: state.graphUiState.mode }), {
    setGraphMode
})(FetchNodeButton)



