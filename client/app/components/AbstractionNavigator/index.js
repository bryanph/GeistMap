/*
 * AbstractionNavigator
 */

import React from 'react';

import { Link, withRouter } from 'react-router-dom'

import { Icon } from 'semantic-ui-react'

import './styles.scss';

class AbstractionNavigator extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const { abstractionChain } = this.props

        const abstractionItems = abstractionChain.map((c, i) => (
            <AbstractionItem
                key={i}
                url={`/app/collections/${c.id}/nodes`}
                name={c.name}
                hasNext={ this.props.extra || (i < (abstractionChain.length - 1)) }
            />
        ))

        return (
            <div className="AbstractionNavigator">
                { abstractionItems }

            </div>
        );
    }
}

const AbstractionItem = ({ url, name, hasNext }) => (
    <div className="AbstractionNavigator-item">
        <Link to={url}>{ name }</Link>
        {
            hasNext ? <Icon name="angle right" /> : null
        }
    </div>
)

export default withRouter(AbstractionNavigator);
