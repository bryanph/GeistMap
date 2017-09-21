'use strict';

export default {
    tree: {
        base: {
            listStyle: 'none',
            backgroundColor: '#21252B',
            margin: 0,
            padding: 0,
            color: '#9DA5AB',
            fontFamily: 'lucida grande ,tahoma,verdana,arial,sans-serif',
            fontSize: '14px'
        },
        node: {
            base: {
                position: 'relative'
            },
            link: {
                cursor: 'pointer',
                position: 'relative',
                padding: '0px 5px',
                display: 'block'
            },
            toggle: {
                base: {
                    position: 'relative',
                    display: 'inline-block',
                    verticalAlign: 'top',
                    marginLeft: '-5px',
                    height: '24px',
                    width: '24px'
                },
                wrapper: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    margin: '-7px 0 0 -7px',
                    height: '14px'
                },
                height: 14,
                width: 14,
                arrow: {
                    fill: '#9DA5AB',
                    strokeWidth: 0
                }
            },
            subtree: {
                listStyle: 'none',
                paddingLeft: '19px'
            },
        }
    }
};
