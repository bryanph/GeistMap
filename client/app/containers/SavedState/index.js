/*
 *
 * SavedState
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames'

import { savedGreen, savedRed } from '../../containers/App/muitheme.js'


const styles = {
    'savedStateContainer': {
        // position: 'absolute',
        // bottom: '0px',
        // left: '30px',
        display: 'inline',
    },
    'savedState': {
        color: savedGreen,
        fontSize: '1.6rem',
        zIndex: 99,
    },
    'savedState-saved': {
        color: savedRed,
    }
}

class SavedState extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { saved } = this.props

        const classes = classNames({
            "savedState": true,
            "savedState-saved": saved,
        })

        const spanStyles = saved ? styles.savedState : Object.assign({}, styles.savedState, styles['savedState-saved'])


        return (
            <div style={styles.savedStateContainer}>
                <span style={spanStyles}>
                    { saved ? "Saved" : "Saving..." }
                </span>
            </div>
        )
    }
}

import { isSynced } from '../../reducers'

function mapStateToProps(state) {
    return {
        saved: isSynced(state)
    }
}

export default connect(mapStateToProps)(SavedState)


