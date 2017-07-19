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

        console.log("MODE", mode);

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

        return (
            <Button.Group>
                <Button
                    circular icon={ "eye" } size="big" className={ viewClass }
                    onClick={ () => this.props.setGraphMode("view") }
                    content="Navigate (n)"
                />
                <Button
                    circular icon={ "edit" } size="big" className={ editClass }
                    onClick={ () => this.props.setGraphMode("edit") }
                    content="Edit (e)"
                />
                <Button
                    circular icon={ "abstract" } size="big" className={ abstractClass }
                    onClick={ () => this.props.setGraphMode("abstract") }
                    content="Abstract (a)"
                />
                <Button
                    circular icon={ "crosshairs" } size="big" className={ focusClass }
                    onClick={ () => this.props.setGraphMode("focus") }
                    content="Focus (f)"
                />
                <Button
                    circular icon={ "expand" } size="big" className={ expandClass }
                    onClick={ () => this.props.setGraphMode("expand") }
                    content="Expand (x)"
                />
            </Button.Group>
        )
    }
}

import { setGraphMode } from '../../actions/ui'

export default connect((state) => ({ mode: state.graphUiState.mode }), {
    setGraphMode
})(GraphModes)



