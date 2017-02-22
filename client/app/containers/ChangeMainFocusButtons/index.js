/*
 *
 * ChangeMainFocusButtons
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import IconButton from 'material-ui/IconButton';
import Edit from 'material-ui/svg-icons/editor/mode-edit';
import Split from 'material-ui/svg-icons/action/view-column';
import Graph from 'material-ui/svg-icons/action/group-work';

const styles = {
    div: {
        display: 'flex',
        flexDirection: 'column',
        // display: 'inline',
        position: 'absolute',
        top: '0',
        right: '20',
        zIndex: 200,
    },
    iconButton: {
        width: 60,
        height: 50,
        padding: 0,
    },
    icon: {
        width: 30,
        height: 30,
    },
}

class ChangeMainFocusButtons extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { changeMainFocus, mainFocus } = this.props

        return (
            <div style={styles.div}>
                <IconButton 
                    style={styles.iconButton} iconStyle={styles.icon}
                    tooltip="Expand editor" onTouchTap={() => changeMainFocus('left')}>
                    <Edit />
                </IconButton>
                <IconButton 
                    style={styles.iconButton} iconStyle={styles.icon} className={'mainFocus-splitscreenButton'}
                    tooltip="Split screen" onTouchTap={() => changeMainFocus('split-screen')}>
                    <Split />
                </IconButton>
                <IconButton 
                    style={styles.iconButton} iconStyle={styles.icon}
                    tooltip="Expand graph view" onTouchTap={() => changeMainFocus('right')}>
                    <Graph />
                </IconButton>
            </div>
            
        )
    }
}

import { changeMainFocus } from '../../actions/ui'

export default connect(
    (state) => ({
        mainFocus: state.uiState.mainFocus,
    }),
    { changeMainFocus }
)(ChangeMainFocusButtons);
