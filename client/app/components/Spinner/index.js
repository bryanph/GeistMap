/**
 *
 * Spinner
 *
 */

import React from 'react';
import CircularProgress from 'material-ui/CircularProgress';

import { accentColor } from '../../containers/App/muitheme'

import { Dimmer, Loader } from 'semantic-ui-react'

const styles = {
    spinner: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    inlineSpinner: {
        display: 'inline',
        // justifyContent: 'center',
        // alignItems: 'center',
        // width: '100%',
        // height: '100%',
    },
}

export function Spinner({ size, style={} }) {
    return (
        <Loader active={true}/>
    )
}

export function InlineSpinner({ size, style={} }) {
    const myStyles = Object.assign({}, styles.inlineSpinner, style)
    return (
        <div style={myStyles}>
            <CircularProgress color={accentColor} size={size || 1.5} />
        </div>
    );
}

export default Spinner

