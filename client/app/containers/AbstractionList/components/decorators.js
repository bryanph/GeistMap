'use strict';

import React from 'react';
import PropTypes from 'prop-types';

export const Loading = () => (
    <div className={'abstractionList-loading'}>loading...</div>
);

export const Toggle = () => {
    return (
        <span>></span>
    );
};


export const Header = ({node}) => {
    return (
        <div className="abstractionList-header">
            <div className="title">
                {node.name}
            </div>
        </div>
    );
};
Header.propTypes = {
    node: PropTypes.object.isRequired
};

