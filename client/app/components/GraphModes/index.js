import React from 'react';
import { connect } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react'
import classNames from 'classnames'

import './styles.scss'

class GraphModes extends React.Component {
    /*
    * On click, move graph in "selectNode" mode
    */
    constructor(props) {
        super(props)
    }

    render() {
        const { mode } = this.props

        const editClass = classNames("graphMode-button", {
            "active": mode === "edit"
        })
        const abstractClass = classNames("graphMode-button", {
            "active": mode === "abstract"
        })
        const deleteClass = classNames("graphMode-button", {
            "active": mode === "delete"
        })

        return (
            <div className="graphModes">
                <span className="graphModes-label">Graph Mode</span>
                <Button.Group vertical>
                    <Button
                        size="medium" className={ editClass }
                        onClick={ () => this.props.setGraphMode("edit") }
                        >
                            <Icon name="edit" /> <span>Edit</span>
                    </Button>

                    <Button
                        size="medium" className={ abstractClass }
                        onClick={ () => this.props.setGraphMode("abstract") }
                    >
                        <Icon name="location arrow" /> <span>Navigate</span>
                    </Button>
                    <Button
                        size="medium" className={ deleteClass }
                        onClick={ () => this.props.setGraphMode("delete") }
                        >
                        <Icon name="remove" /> <span>Remove</span>
                    </Button>
                </Button.Group>
            </div>
        )
    }
}

import { setGraphMode } from '../../actions/ui'

export default connect((state) => ({ mode: state.graphUiState.mode }), {
    setGraphMode
})(GraphModes)
