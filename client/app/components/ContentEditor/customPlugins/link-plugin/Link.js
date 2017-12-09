import React from 'react';
import { Entity } from 'draft-js';

const Link = (props) => {
  const { href } = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a href={href} target="_blank">
      {props.children}
    </a>
  );
};

export default Link;
