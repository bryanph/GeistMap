import React, { PropTypes } from 'react'

/*
 * hasLoaded is a method returning true/false
*/
export const LoaderWrapper = function(hasLoaded, Component, LoaderComponent, onLoad) {
    return props => {
	if (hasLoaded(props)) {
	    return <Component {...props} />
	}
	else {
	    if (onLoad) onLoad(props)

	    return <LoaderComponent />
	}
    }
}

export const YetAnotherLoader = props => (
    <div id="loader">Loading...</div>
)

export const GeneralLoader = props => (
	<div id="general-loader">
		<img src="img/loader.svg" /> Loading... 
	</div>
)

export const ChartLoader = props => (
	<div id="chart-loader" className={props.className}>
        <div className="content">
            <img src="img/loader.svg" /> Updating... 
        </div>
    </div>
)


