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
        const { selectMode } = this.props

        const buttonClass = classNames("focusButton-button", {
            "active": selectMode && selectMode.mode === 'focus'
        })

        console.log('called', selectMode);

        return (
            <Button 
                circular icon={ "crosshairs" } size="big" className={ buttonClass }
                onClick={ () => this.props.toggleSelectNode('focus') }
            />
        )
    }
}

import { toggleSelectNode } from '../../actions/ui'

export default connect((state) => ({ selectMode: state.graphUiState.selectMode }), {
    toggleSelectNode
})(FocusButton)


