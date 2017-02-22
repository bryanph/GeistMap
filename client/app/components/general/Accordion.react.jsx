
import _ from 'lodash'
import React, { PropTypes } from 'react'
import classNames from 'classnames'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

export const Accordion = React.createClass({
    /*
     * A list of accordions, acting as containers
     */

    propTypes: {
        // containers: PropTypes.arrayOf(PropTypes.elements).isRequired, // what is rendered in accordion
        onClick: PropTypes.func, // when clicking on the list item

        active: PropTypes.number, // index of active item

        ulClass: PropTypes.string,
        liClass: PropTypes.string,
        activeClass: PropTypes.string,
    },

    render: function() {

        // required
        let { children } = this.props
        // optional
        let { active, ulClass, liClass, activeClass } = this.props


//         let listItems = _.map(containers, container => (
//             <li className={classNames(liClass, activeClass)} onClick={onClick.bindArgs(c)}>
//                 {container}
//             </li>
//         ))

        return (
            <ul className={ulClass}>
                {children}
            </ul>
        )
    }
})

// TODO: Write Searchable composer - 2016-03-01
import store from '../../app'
import { SearchInput } from './List.react.jsx'
import { changeSearchString, resetSearchString } from '../../actions/sync'

export const SearchableAccordion = React.createClass({

    dispatchAction: function(value) {
        store.dispatch(changeSearchString(value))
    },

    onInputChange: function(event) {
        // this.setState({ filter: value })
        this.dispatchAction(event.target.value)
    },

    render: function() {
        const { searchInputProps, divProps } = this.props

        return (
            <div {...divProps}>
                <SearchInput {...searchInputProps} onChange={this.onInputChange}/>
                <Accordion {...this.props}>
                    { this.props.children }
                </Accordion>
            </div>
        )
    }
})

// TODO: Make this more a wrapper, making the a tag and div a React component - 2016-03-17
export const AccordionItem = React.createClass({

    propTypes: {
        title: PropTypes.string.isRequired,
        initialActive: PropTypes.bool,

        liClass: PropTypes.string,
        hrefClass: PropTypes.string, // title
        divClass: PropTypes.string, // div
    },

    getInitialState: function() {
        return {
            active: this.props.initialActive || false
        }
    },

    onClick: function(e) {
        e.preventDefault();
        this.setState({ active: !this.state.active })
    },

    render: function() {
        let active = this.state.active
        let { title } = this.props
        let {liClass, hrefClass, divClass } = this.props

        let liFinalClass = classNames(liClass, {
            dropped : active,
        })

        return (
            <li className={liFinalClass}>
                <a href="#" onClick={this.onClick} className={hrefClass}><span>{title}</span></a>
                
                <ReactCSSTransitionGroup transitionName="drop" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
                    { active ? <div className={divClass}> {this.props.children} </div> : null }
                </ReactCSSTransitionGroup>
            </li>
        )
    }
})

