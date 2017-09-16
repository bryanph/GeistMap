import React, { Component } from 'react'
import RedBox from 'redbox-react'

// TODO: different error page for production - 2017-09-16
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            info: null,
        };
    }

    componentDidCatch(error, info) {
        // Display fallback UI
        this.setState({
            hasError: true,
            error,
            info,
        });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <RedBox error={this.state.error} />
        }
        return this.props.children;
    }
}

export default ErrorBoundary
