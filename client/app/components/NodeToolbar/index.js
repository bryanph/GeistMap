
import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import './styles.css'

import { accentColor, secondaryTextColor } from '../../containers/App/muitheme.js'

const styles = {
    nodeSubtitle: {
        fontSize: '1rem',
        color: secondaryTextColor,
    },
};

import EditableTitle from '../../components/EditableTitle'
import moment from 'moment'

export const NodeTitle = ({ title, updateNode }) => (
    <span>
        <EditableTitle 
            title={title}
            updateNode={updateNode}
        />
    </span>
)
export const NodeSubtitle = ({ node }) => (
    <span style={styles.nodeSubtitle}>
        { moment.unix(node.properties.modified / 1000).fromNow() } 
    </span>   
)
