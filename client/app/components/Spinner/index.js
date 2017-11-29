/**
 *
 * Spinner
 *
 */

import React from 'react';

import { Dimmer, Loader } from 'semantic-ui-react'

export function Spinner({ size, style={} }) {
    return (
        <Loader active={true}/>
    )
}

export default Spinner

