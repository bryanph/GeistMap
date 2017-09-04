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
        const { collectionChain } = this.props

        const collectionChainIds = collectionChain.map(x => x.id)

        const abstractionItems = collectionChain.map((c, i) => (
            <AbstractionItem
                key={c.id}
                url={`/app/collections/${collectionChainIds.slice(0, i+1).join('/')}/nodes`}
                name={c.name}
                hasNext={ i < (collectionChain.length - 1) }
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
