
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
        const { graphType, id } = this.props

        const abstractionClass = classNames("graphTypeSwitcher-button", {
            "active": graphType === "collection"
        })
        const exploreClass = classNames("graphTypeSwitcher-button", {
            "active": graphType === "node"
        })

        return (
            <div className="graphTypeSwitcher">
                <span className="graphTypeSwitcher-label">Graph Type</span>
                <Button.Group vertical labeled icon>
                    <Button 
                        icon='triangle down'
                        content='Abstraction'
                        onClick={ () => this.props.history.push(`/app/collections/${id}/nodes`) }
                        className={ abstractionClass }
                    />
                    <Button 
                        icon='crosshairs'
                        content='Explore'
                        onClick={ () => this.props.history.push(`/app/nodes/${id}`) }
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
