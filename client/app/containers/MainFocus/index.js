/*
 *
 * MainFocus
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames'

import ChangeMainFocusButtons from '../../containers/ChangeMainFocusButtons'

import './styles.css'

class MainFocus extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { left, right, mainFocus } = this.props

        const leftClass = classNames('mainFocus-left', {
            'fullscreen': mainFocus === 'left',
            'splitscreen': mainFocus === 'split-screen',
            'collapsed': mainFocus === 'right'
        })
        const rightClass = classNames('mainFocus-right', {
            'fullscreen': mainFocus === 'right',
            'splitscreen': mainFocus === 'split-screen',
            'collapsed': mainFocus === 'left'
        })

        return (
            <div className="mainFocus">

                { // <ChangeMainFocusButtons /> 
                }

                <div className={ leftClass }>
                    { left }
                </div>

                <div className={ rightClass }>
                    { right }
                </div>
            </div>
            
        )
    }
}

export default connect(
    (state) => ({
        mainFocus: state.uiState.mainFocus
    }), 
    )(MainFocus);
