
import _ from 'lodash'
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import Radium from 'radium'

import { OverviewTopbar } from '../../components/Topbar'
import { getNodes, getEdges } from '../../reducers'
import { createNode } from '../../actions/async'
import AddButton from '../../components/AddButton'

import './styles.css'

import NodeCreateButton from '../NodeCreateButton'
import Inbox from '../Inbox'


const NodeOverview = React.createClass({

    render: function() {
        return (
            <div className="nodeOverview row">
                {/* <OverviewTopbar /> */}
                <div className="medium-10 medium-offset-1 column">
                    <div className="nodeOverview-createButton">
                        <NodeCreateButton style={{position: 'absolute', top: "28px", display: 'inline-block'}} />
                    </div>
                    <div className="nodeOverview-content">
                        <Inbox />
                    </div>
                </div>
            </div>
        )
    }
})

export default NodeOverview
