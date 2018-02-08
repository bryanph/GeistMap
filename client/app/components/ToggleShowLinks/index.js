import React from 'react';
import { toggleShowLinks } from '../../actions/ui'
import { connect } from 'react-redux'
import { Button } from 'semantic-ui-react'

class ToggleShowLinks extends React.Component {
    render() {
        const styles = {
            position: "absolute",
            zIndex: 100,
            right: '10px',
            bottom: '46px',
        }
        return (
            <Button style={styles} toggle active={this.props.active} onClick={this.props.toggleShowLinks}>
                Show Links
            </Button>
        )
    }
}

ToggleShowLinks = connect(
    (state) => ({ active: state.uiState.showLinks }),
    { toggleShowLinks }
)(ToggleShowLinks)

export default ToggleShowLinks
