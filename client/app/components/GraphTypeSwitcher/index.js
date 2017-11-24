
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

        const abstractionClass = classNames("GraphTypeSwitcher-button", {
            "active": graphType === "collection"
        })
        const exploreClass = classNames("GraphTypeSwitcher-button", {
            "active": graphType === "node"
        })

        return (
            <Button.Group vertical labeled icon className="graphTypeSwitcher">
                <Button 
                    icon='triangle down'
                    content='Children'
                    onClick={ () => this.props.history.push(`/app/collections/${id}/nodes`) }
                    className={ abstractionClass }
                />
                <Button 
                    icon='crosshairs'
                    content='Relations'
                    onClick={ () => this.props.history.push(`/app/nodes/${id}`) }
                    className={ exploreClass }
                />
            </Button.Group>
        )
    }
}

// export default connect((state) => ({ mode: state.graphUiState.mode }), {
//     setGraphMode
// })(GraphTypeSwitcher)

export default withRouter(GraphTypeSwitcher)
