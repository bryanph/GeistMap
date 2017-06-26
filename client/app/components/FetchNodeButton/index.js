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
        const { selectMode } = this.props

        const buttonClass = classNames("fetchNodeButton-button", {
            "active": selectMode && selectMode.mode === 'fetch'
        })

        console.log(selectMode);

        return (
            <Button 
                circular icon={ "expand" } size="big" className={ buttonClass }
                onClick={ () => this.props.toggleSelectNode('fetch') }
            />
        )
    }
}

import { toggleSelectNode } from '../../actions/ui'

export default connect((state) => ({ selectMode: state.graphUiState.selectMode }), {
    toggleSelectNode
})(FetchNodeButton)



