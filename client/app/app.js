'use strict'

require('../scss/app.scss')
require('../css/global.css')
import 'semantic-ui-css/semantic.min.css';

import React from 'react'
import ReactDom from 'react-dom'
import { AppContainer } from 'react-hot-loader'

import Root from './containers/Root'

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

// disable redbox-react
delete AppContainer.prototype.unstable_handleError

const render = Component => {
    ReactDom.render(
        <AppContainer>
            <Component />
        </AppContainer>
        ,
        document.getElementById('app')
    );
}

document.addEventListener('DOMContentLoaded', () => render(Root));


if (module.hot) {
    module.hot.accept('./containers/Root', () => { render(Root) })
}
