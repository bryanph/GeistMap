
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
        const hierarchyClass = classNames("graphTypeSwitcher-button", {
            "active": graphType === "hierarchy"
        })
        const exploreClass = classNames("graphTypeSwitcher-button", {
            "active": graphType === "explore"
        })

        return (
            <div className="graphTypeSwitcher">
                <Button.Group className="graphTypeSwitcher-buttons">
                    {
                        /*
                    <Button 
                        icon='edit'
                        content='Notes'
                        onClick={ () => this.props.history.push(`/app/nodes/${id}/edit` + this.props.history.location.search) }
                        className={ editorClass }
                    />
                    */
                    }
                    <Button 
                        icon='triangle down'
                        content='Child map'
                        onClick={ () => this.props.history.push(`/app/nodes/${id}/graph?graphType=abstract`) }
                        className={ abstractionClass }
                    />
                    <Button 
                        icon='triangle down'
                        content='Hierarchy'
                        onClick={ () => this.props.history.push(`/app/nodes/${id}/graph?graphType=hierarchy`) }
                        className={ hierarchyClass }
                    />
                    <Button 
                        icon='crosshairs'
                        content='Link map'
                        onClick={ () => this.props.history.push(`/app/nodes/${id}/graph?graphType=explore`) }
                        disabled={!node || node.type === "root"}
                        className={ exploreClass }
                    />
                </Button.Group>
            </div>
        )
    }
}

export default withRouter(GraphTypeSwitcher)
