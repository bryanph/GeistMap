
import React from 'react';
import { connect } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react'
import classNames from 'classnames'

import './styles.scss'

import { withRouter } from 'react-router'

class GraphTypeSwitcher extends React.Component {
    /*
    * On click, move graph in "selectNode" mode
    */
    constructor(props) {
        super(props)
    }

    render() {
        const { graphType, id, node } = this.props

        const editorClass = classNames("graphTypeSwitcher-button", {
            "active": graphType === "editor"
        })
        const abstractionClass = classNames("graphTypeSwitcher-button", {
            "active": graphType === "abstract"
        })
        const exploreClass = classNames("graphTypeSwitcher-button", {
            "active": graphType === "explore"
        })

        return (
            <div className="graphTypeSwitcher">
                <Button.Group className="graphTypeSwitcher-buttons">
                    <Button 
                        icon='triangle down'
                        content='Hierarchy map'
                        onClick={ () => this.props.history.push({
                            pathname: `/app/nodes/${id}/graph`,
                            search: 'graphType=explore'
                        }) }
                        className={ exploreClass }
                    />
                    <Button 
                        icon='crosshairs'
                        content='Link map'
                        onClick={ () => this.props.history.push({
                            pathname: `/app/nodes/${id}/graph`,
                            search: 'graphType=abstract'
                        }) }
                        className={ abstractionClass }
                    />
                </Button.Group>
            </div>
        )
    }
}

export default withRouter(GraphTypeSwitcher)
