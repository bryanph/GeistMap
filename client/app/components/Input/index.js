import _ from 'lodash'
import React, { PropTypes } from 'react'

import numeral from 'numeral'

import './styles.css'

export function controlled(InputComponent) {
    /*
     * HOF for creating a controlled input
     * // TODO: should this also merge in value prop if set? - 2016-08-05
    */
    class ControlledInput extends React.Component {
        constructor(props) {
            super(props)
            this.onChange = this.onChange.bind(this)

            this.state = { value: props.value || '' }
        }

        // componentWillReceiveProps(nextProps) {
        //     console.log(nextProps);
        //     if (nextProps.value !== this.state.value) {
        //         console.log(nextProps.value);
        //         this.setState({ value: nextProps.value })
        //     }
        // }

        onChange(event) {
            event.persist()

            if (this.props.onChange) {
                this.props.onChange(event)
            }

            this.setState({value: event.target.value})
        }

        render() {
            return (
                <InputComponent 
                    {...this.props} 
                    value={this.state.value} 
                    onChange={this.onChange} 
                />
            )
        }
    }
    ControlledInput.propTypes = {
        
    }

    return ControlledInput
}

export function debounced(Component, timeout=1000) {
    /*
     * HOF for creating a debounced onChange method
    */

    class DebouncedComponent extends React.Component {
        constructor(props) {
            super(props)

            this.onChange = this.onChange.bind(this)
            this.debounced = _.debounce(props.debouncedOnChange, timeout)
        }

        cancel() {
            /*
             * Public method to cancel debounce
            */
           this.debounced.cancel()
        }

        onChange(event) {
            event.persist()

            if (this.props.onChange) {
                this.props.onChange(event)
            }

            this.debounced(event)
        }
    
        render() {
            return (
                <Component {...this.props} onChange={this.onChange} />
            )
        }
    }
    DebouncedComponent.propTypes = {
        debouncedOnChange: PropTypes.func.isRequired,
        onChange: PropTypes.func,
    }

    return DebouncedComponent
}

const Input = (props) => <input {...props} />
export const InputText = (props) => (
    <Input type='text' className={"input"} {...props} />
)
export const InputNumber = (props) => (
    <Input type="number" {...props} />
)


import TextField from 'material-ui/TextField'
export TextField from 'material-ui/TextField'


export const ControlledTextField = controlled(TextField)

export const DebouncedTextField = debounced(controlled(TextField))
export const DebouncedTextField500 = debounced(controlled(TextField), 500)
