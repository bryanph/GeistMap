import React from 'react';
import { connect } from 'react-redux'
import Snackbar from 'material-ui/Snackbar';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

class Errors extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
        };
    }

    componentWillReceiveProps = () => {
        this.setState({ open: true })
    }

    handleActionTouchTap = () => {
        this.setState({
            open: false,
        });
    };

    handleRequestClose = () => {
        this.setState({
            open: false,
        });
    };

    render() {
        const { error } = this.props

        return (
            <div>
                <Snackbar
                    open={this.state.open}
                    message={error && error.message}
                    action="close"
                    autoHideDuration={5000}
                    onActionTouchTap={this.handleActionTouchTap}
                    onRequestClose={this.handleRequestClose}
                />
            </div>
        );
    }
}

function mapStateToProps(state) {
    const errors = state.errors.errors
    const error = state.errors.lastError

    return {
        error,
    }
}

export default connect(mapStateToProps, {})(Errors)
