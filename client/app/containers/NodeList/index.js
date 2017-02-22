/*
 *
 * NodeList
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment'

import { withRouter } from 'react-router'

import './styles.scss'

export const NodeItem = ({ node, router }) => (
    <GridTile
        title={node.properties.name}
        subtitle={moment.unix(node.properties.modified / 1000).fromNow()}
        actionIcon={
            <IconButton onTouchTap={() => router.push(`/app/nodes/${node.id}/edit`)}>
                <Edit color="white" />
            </IconButton>
        }
    >
        <div style={{ backgroundColor: '#FAFAFA', width: '100%', height: '100%' }}></div>
    </GridTile>

)

import {GridList, GridTile} from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import Edit from 'material-ui/svg-icons/editor/mode-edit';

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: '100%',
    overflowY: 'auto',
    margin: '0 auto',
    padding: '2rem',
    flexGrow: 1,
    height: '100%',
  },
};

const tilesData = [
  {
    img: 'images/grid-list/00-52-29-429_640.jpg',
    title: 'Breakfast',
    author: 'jill111',
  },
  {
    img: 'images/grid-list/burger-827309_640.jpg',
    title: 'Tasty burger',
    author: 'pashminu',
  },
  {
    img: 'images/grid-list/camera-813814_640.jpg',
    title: 'Camera',
    author: 'Danson67',
  },
  {
    img: 'images/grid-list/morning-819362_640.jpg',
    title: 'Morning',
    author: 'fancycrave1',
  },
  {
    img: 'images/grid-list/hats-829509_640.jpg',
    title: 'Hats',
    author: 'Hans',
  },
  {
    img: 'images/grid-list/honey-823614_640.jpg',
    title: 'Honey',
    author: 'fancycravel',
  },
  {
    img: 'images/grid-list/vegetables-790022_640.jpg',
    title: 'Vegetables',
    author: 'jill111',
  },
  {
    img: 'images/grid-list/water-plant-821293_640.jpg',
    title: 'Water plant',
    author: 'BkrmadtyaKarki',
  },
];

export class NodeList extends React.Component { // eslint-disable-line react/prefer-stateless-function
    render() {
        const { nodes } = this.props

        const tiles = nodes.map(node => 
            <NodeItem key={node.id} node={node} router={this.props.router} />
        )
        console.log(nodes);

        return (
            <div className="nodeList">
                <GridList
                    cellHeight={'auto'}
                    cols={3}
                    style={styles.gridList}
                >
                    { tiles }
                </GridList>
            </div>
        );
    }
}

const mapStateToProps = function(state) {
    return {}
}

export default connect(mapStateToProps, {

})(withRouter(NodeList));
