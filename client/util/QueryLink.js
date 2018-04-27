import React from 'react';
import { withRouter, Link } from 'react-router-dom'

const QueryLink = withRouter(({ staticContext, ...props }) => {
    /*
     * A link that preserves the query string
    */
    const to = typeof props.to === 'string' ?
        {
            search: props.location.search,
            pathname: props.to
        } :
        {
            ...props.to,
            search: props.location.search,
            pathname: props.to.pathname
        }

    return (
        <Link 
            {...props}
            to={to}
        >{props.children}</Link>
    )
})

export default QueryLink
