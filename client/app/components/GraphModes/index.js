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

        const viewClass = classNames("graphMode-button", {
            "active": mode === "view"
        })
        const editClass = classNames("graphMode-button", {
            "active": mode === "edit"
        })
        const focusClass = classNames("graphMode-button", {
            "active": mode === "focus"
        })
        const expandClass = classNames("graphMode-button", {
            "active": mode === "expand"
        })
        const abstractClass = classNames("graphMode-button", {
            "active": mode === "abstract"
        })
        const deleteClass = classNames("graphMode-button", {
            "active": mode === "delete"
        })

        return (
            <Button.Group className="graphMode">
                <Button
                    size="big" className={ viewClass }
                    onClick={ () => this.props.setGraphMode("view") }
                >
                    <Icon name="eye" /> <span>Navigate (n)</span>
                </Button>
                <Button
                    size="big" className={ editClass }
                    onClick={ () => this.props.setGraphMode("edit") }
                >
                    <Icon name="edit" /> <span>Edit (e)</span>
                </Button>
                <Button
                    size="big" className={ abstractClass }
                    onClick={ () => this.props.setGraphMode("abstract") }
                >
                    <Icon name="abstract" /> <span>Abstract (a)</span>
                </Button>
                <Button
                    size="big" className={ focusClass }
                    onClick={ () => this.props.setGraphMode("focus") }
                >
                    <Icon name="crosshairs" /> <span>Focus (f)</span>
                </Button>
                <Button
                    size="big" className={ expandClass }
                    onClick={ () => this.props.setGraphMode("expand") }
                >
                    <Icon name="expand" /> <span>Expand (x)</span>
                </Button>
                <Button
                    icon={ "trash" } size="big" className={ deleteClass }
                    onClick={ () => this.props.setGraphMode("delete") }
                    content="Delete (d)"
                >
                    <Icon name="trash" /> <span>Delete (d)</span>
                </Button>
            </Button.Group>
        )
    }
}

import { setGraphMode } from '../../actions/ui'

export default connect((state) => ({ mode: state.graphUiState.mode }), {
    setGraphMode
})(GraphModes)
