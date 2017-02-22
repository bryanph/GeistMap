/*
 * Custo plugin for Node links
*/

import linkStrategy from './linkStrategy';
import Link from './Link';

const customLinkPlugin = (config = {}) => {
  return {
    decorators: [{
      strategy: linkStrategy,
      component: Link,
    }]
  };
};

export default customLinkPlugin;
