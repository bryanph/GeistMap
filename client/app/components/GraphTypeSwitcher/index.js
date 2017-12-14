
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
            "active": graphType === "collection"
        })
        const exploreClass = classNames("graphTypeSwitcher-button", {
            "active": graphType === "node"
        })

        return (
            <div className="graphTypeSwitcher">
                <Button.Group className="graphTypeSwitcher-buttons">
                    <Button 
                        icon='edit'
                        content='Notes'
                        onClick={ () => this.props.history.push(`/app/nodes/${id}/edit`) }
                        className={ editorClass }
                    />
                    <Button 
                        icon='triangle down'
                        content='Map'
                        onClick={ () => this.props.history.push(`/app/collections/${id}/nodes`) }
                        className={ abstractionClass }
                    />
                    <Button 
                        icon='crosshairs'
                        content='Links'
                        onClick={ () => this.props.history.push(`/app/nodes/${id}`) }
                        disabled={!node || node.type === "root"}
                        className={ exploreClass }
                    />
                </Button.Group>
            </div>
        )
    }
}

// export default connect((state) => ({ mode: state.graphUiState.mode }), {
//     setGraphMode
// })(GraphTypeSwitcher)

export default withRouter(GraphTypeSwitcher)
