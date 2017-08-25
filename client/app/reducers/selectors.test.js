import {
    getNodesAndEdgesByCollectionId,
} from './index.js'

const uuidV4 = require('uuid/v4');

describe('getNodesAndEdgesByCollectionId', () => {
    /*
     * Test the abstraction selector works properly
     */
    test('given only nodes, give the desired state', () => {

        const initialState = {
            entities: {
                nodes: {
                    '70641d88-d5cf-4a77-8c1c-803a49efbf53': {
                        collapsed: true,
                        name: 'b',
                        modified: '1501676088237',
                        id: '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                        type: 'node',
                        created: '1501676088237',
                        collections: [
                            'collectionB'
                        ],
                    },
                    '07d160dc-a5ef-4164-8268-98e6a614a03d': {
                        collapsed: true,
                        name: 'c',
                        modified: '1501676088678',
                        id: '07d160dc-a5ef-4164-8268-98e6a614a03d',
                        type: 'node',
                        created: '1501676088678',
                        collections: [
                            'collectionB'
                        ],
                    },
                    '11e9d4f4-8c2b-4763-b4a3-bc421fa80764': {
                        collapsed: true,
                        name: 'd',
                        modified: '1501676089056',
                        id: '11e9d4f4-8c2b-4763-b4a3-bc421fa80764',
                        type: 'node',
                        created: '1501676089056',
                        collections: [
                            'collectionB'
                        ],
                    },
                    '563252f9-26fd-4405-a177-7e486dc1ddaa': {
                        collapsed: true,
                        name: 'a',
                        modified: '1501676087771',
                        id: '563252f9-26fd-4405-a177-7e486dc1ddaa',
                        type: 'node',
                        created: '1501676087771',
                        collections: [
                            'collectionB'
                        ],
                    }
                },
                edges: {
                    '153980b5-ac4a-4b70-9876-fdda4a22348a': {
                        end: '563252f9-26fd-4405-a177-7e486dc1ddaa',
                        start: '07d160dc-a5ef-4164-8268-98e6a614a03d',
                        id: '153980b5-ac4a-4b70-9876-fdda4a22348a'
                    },
                    '0caff5e7-d3d2-42a6-99ee-74e36fa706b8': {
                        end: '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                        start: '563252f9-26fd-4405-a177-7e486dc1ddaa',
                        id: '0caff5e7-d3d2-42a6-99ee-74e36fa706b8'
                    }
                },
                collections: {
                    collectionB: {
                        name: 'My knowledge base',
                        modified: '1501673504600',
                        id: 'collectionB',
                        type: 'root',
                        isRootCollection: true,
                        collections: [
                            'collectionB'
                        ],
                        nodes: [
                            '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                            '07d160dc-a5ef-4164-8268-98e6a614a03d',
                            '11e9d4f4-8c2b-4763-b4a3-bc421fa80764',
                            '563252f9-26fd-4405-a177-7e486dc1ddaa'
                        ]
                    }
                },
                collectionEdges: {}
            },
            adjacencyMap: {
                '07d160dc-a5ef-4164-8268-98e6a614a03d': [
                    '563252f9-26fd-4405-a177-7e486dc1ddaa'
                ],
                '563252f9-26fd-4405-a177-7e486dc1ddaa': [
                    '70641d88-d5cf-4a77-8c1c-803a49efbf53'
                ]
            },
            reverseAdjacencyMap: {
                '563252f9-26fd-4405-a177-7e486dc1ddaa': [
                    '07d160dc-a5ef-4164-8268-98e6a614a03d'
                ],
                '70641d88-d5cf-4a77-8c1c-803a49efbf53': [
                    '563252f9-26fd-4405-a177-7e486dc1ddaa'
                ]
            },
            edgeListMap: {
                '70641d88-d5cf-4a77-8c1c-803a49efbf53': {
                    from: [],
                    to: [
                        '0caff5e7-d3d2-42a6-99ee-74e36fa706b8'
                    ]
                },
                '07d160dc-a5ef-4164-8268-98e6a614a03d': {
                    from: [
                        '153980b5-ac4a-4b70-9876-fdda4a22348a'
                    ],
                    to: []
                },
                '11e9d4f4-8c2b-4763-b4a3-bc421fa80764': {
                    from: [],
                    to: []
                },
                '563252f9-26fd-4405-a177-7e486dc1ddaa': {
                    from: [
                        '0caff5e7-d3d2-42a6-99ee-74e36fa706b8'
                    ],
                    to: [
                        '153980b5-ac4a-4b70-9876-fdda4a22348a'
                    ]
                }
            },
            pathL1Cache: {},
            pathL2Cache: {},
            nodesByCollectionId: {
                collectionB: [
                    '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                    '07d160dc-a5ef-4164-8268-98e6a614a03d',
                    '11e9d4f4-8c2b-4763-b4a3-bc421fa80764',
                    '563252f9-26fd-4405-a177-7e486dc1ddaa'
                ]
            },
            abstractionDetail: {
                collectionB: {
                    nodes: [
                        '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                        '07d160dc-a5ef-4164-8268-98e6a614a03d',
                        '11e9d4f4-8c2b-4763-b4a3-bc421fa80764',
                        '563252f9-26fd-4405-a177-7e486dc1ddaa'
                    ],
                    edges: [
                        '153980b5-ac4a-4b70-9876-fdda4a22348a',
                        '0caff5e7-d3d2-42a6-99ee-74e36fa706b8'
                    ]
                }
            },
        }

        const nodes = [ '70641d88-d5cf-4a77-8c1c-803a49efbf53', '07d160dc-a5ef-4164-8268-98e6a614a03d', '11e9d4f4-8c2b-4763-b4a3-bc421fa80764', '563252f9-26fd-4405-a177-7e486dc1ddaa' ]
        const edges = [ '153980b5-ac4a-4b70-9876-fdda4a22348a', '0caff5e7-d3d2-42a6-99ee-74e36fa706b8' ]

        const collections = []
        const visibleCollections = []
        const collectionChain = [ 'collectionB' ]

        const result = getNodesAndEdgesByCollectionId(initialState, "collectionB")
        expect(result.nodes.map(x => x.id)).toEqual(nodes)
        expect(result.edges.map(x => x.id)).toEqual(edges)
        expect(result.collections.map(x => x.id)).toEqual(collections)
        expect(result.visibleCollections.map(x => x.id)).toEqual(visibleCollections)
        expect(result.collectionChain.map(x => x.id)).toEqual(collectionChain)
    })

    test('Given one node abstraction with one node in it and explicit links, give the desired state', () => {
        const initialState = {
            entities: {
                nodes: {
                    '70641d88-d5cf-4a77-8c1c-803a49efbf53': {
                        collapsed: true,
                        name: 'b',
                        modified: '1501676088237',
                        id: '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                        type: 'node',
                        created: '1501676088237',
                        collections: [
                            'collectionB'
                        ],
                    },
                    '07d160dc-a5ef-4164-8268-98e6a614a03d': {
                        collapsed: true,
                        name: 'c',
                        modified: '1501676088678',
                        id: '07d160dc-a5ef-4164-8268-98e6a614a03d',
                        type: 'node',
                        created: '1501676088678',
                        collections: [
                            'collectionB'
                        ],
                    },
                    '563252f9-26fd-4405-a177-7e486dc1ddaa': {
                        collapsed: true,
                        name: 'a',
                        modified: '1501676087771',
                        id: '563252f9-26fd-4405-a177-7e486dc1ddaa',
                        type: 'node',
                        created: '1501676087771',
                        collections: [
                            'collectionB'
                        ],
                    },
                    'f6ca9085-8c2b-4565-93d0-813c223e369f': {
                        collapsed: true,
                        name: 'e',
                        modified: '1501676902947',
                        id: 'f6ca9085-8c2b-4565-93d0-813c223e369f',
                        type: 'collection',
                        created: '1501676902947',
                        collections: [
                            'collectionB'
                        ],
                        count: 1,
                    },
                    '11e9d4f4-8c2b-4763-b4a3-bc421fa80764': {
                        collapsed: true,
                        name: 'd',
                        modified: '1501676089056',
                        id: '11e9d4f4-8c2b-4763-b4a3-bc421fa80764',
                        type: 'node',
                        created: '1501676089056',
                        collections: [
                            'collectionB',
                            'f6ca9085-8c2b-4565-93d0-813c223e369f'
                        ],
                    }
                },
                edges: {
                    '724884a3-e436-46cc-8264-2091e28145ad': {
                        end: '563252f9-26fd-4405-a177-7e486dc1ddaa',
                        start: 'f6ca9085-8c2b-4565-93d0-813c223e369f',
                        id: '724884a3-e436-46cc-8264-2091e28145ad'
                    },
                    '153980b5-ac4a-4b70-9876-fdda4a22348a': {
                        end: '563252f9-26fd-4405-a177-7e486dc1ddaa',
                        start: '07d160dc-a5ef-4164-8268-98e6a614a03d',
                        id: '153980b5-ac4a-4b70-9876-fdda4a22348a'
                    },
                    '0caff5e7-d3d2-42a6-99ee-74e36fa706b8': {
                        end: '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                        start: '563252f9-26fd-4405-a177-7e486dc1ddaa',
                        id: '0caff5e7-d3d2-42a6-99ee-74e36fa706b8'
                    }
                },
                collections: {
                    collectionB: {
                        name: 'My knowledge base',
                        modified: '1501673504600',
                        id: 'collectionB',
                        type: 'root',
                        isRootCollection: true,
                        collections: [
                            'collectionB'
                        ],
                        nodes: [
                            '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                            '07d160dc-a5ef-4164-8268-98e6a614a03d',
                            '563252f9-26fd-4405-a177-7e486dc1ddaa',
                            'f6ca9085-8c2b-4565-93d0-813c223e369f'
                        ]
                    },
                    'f6ca9085-8c2b-4565-93d0-813c223e369f': {
                        name: 'e',
                        modified: '1501676902947',
                        id: 'f6ca9085-8c2b-4565-93d0-813c223e369f',
                        type: 'collection',
                        created: '1501676902947',
                        collections: [
                            'f6ca9085-8c2b-4565-93d0-813c223e369f',
                            'collectionB'
                        ],
                        nodes: [
                            '11e9d4f4-8c2b-4763-b4a3-bc421fa80764'
                        ]
                    }
                },
                collectionEdges: {}
            },
            adjacencyMap: {
                'f6ca9085-8c2b-4565-93d0-813c223e369f': [
                    '563252f9-26fd-4405-a177-7e486dc1ddaa',
                    '563252f9-26fd-4405-a177-7e486dc1ddaa'
                ],
                '07d160dc-a5ef-4164-8268-98e6a614a03d': [
                    '563252f9-26fd-4405-a177-7e486dc1ddaa',
                    '563252f9-26fd-4405-a177-7e486dc1ddaa'
                ],
                '563252f9-26fd-4405-a177-7e486dc1ddaa': [
                    '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                    '70641d88-d5cf-4a77-8c1c-803a49efbf53'
                ]
            },
            reverseAdjacencyMap: {
                '563252f9-26fd-4405-a177-7e486dc1ddaa': [
                    'f6ca9085-8c2b-4565-93d0-813c223e369f',
                    '07d160dc-a5ef-4164-8268-98e6a614a03d',
                    'f6ca9085-8c2b-4565-93d0-813c223e369f',
                    '07d160dc-a5ef-4164-8268-98e6a614a03d'
                ],
                '70641d88-d5cf-4a77-8c1c-803a49efbf53': [
                    '563252f9-26fd-4405-a177-7e486dc1ddaa',
                    '563252f9-26fd-4405-a177-7e486dc1ddaa'
                ]
            },
            edgeListMap: {
                '70641d88-d5cf-4a77-8c1c-803a49efbf53': {
                    from: [],
                    to: [
                        '0caff5e7-d3d2-42a6-99ee-74e36fa706b8',
                        '0caff5e7-d3d2-42a6-99ee-74e36fa706b8'
                    ]
                },
                '07d160dc-a5ef-4164-8268-98e6a614a03d': {
                    from: [
                        '153980b5-ac4a-4b70-9876-fdda4a22348a',
                        '153980b5-ac4a-4b70-9876-fdda4a22348a'
                    ],
                    to: []
                },
                '563252f9-26fd-4405-a177-7e486dc1ddaa': {
                    from: [
                        '0caff5e7-d3d2-42a6-99ee-74e36fa706b8',
                        '0caff5e7-d3d2-42a6-99ee-74e36fa706b8'
                    ],
                    to: [
                        '724884a3-e436-46cc-8264-2091e28145ad',
                        '153980b5-ac4a-4b70-9876-fdda4a22348a',
                        '724884a3-e436-46cc-8264-2091e28145ad',
                        '153980b5-ac4a-4b70-9876-fdda4a22348a'
                    ]
                },
                'f6ca9085-8c2b-4565-93d0-813c223e369f': {
                    from: [
                        '724884a3-e436-46cc-8264-2091e28145ad',
                        '724884a3-e436-46cc-8264-2091e28145ad'
                    ],
                    to: []
                },
                '11e9d4f4-8c2b-4763-b4a3-bc421fa80764': {
                    from: [],
                    to: []
                }
            },
            nodesByCollectionId: {
                collectionB: [
                    '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                    '07d160dc-a5ef-4164-8268-98e6a614a03d',
                    '563252f9-26fd-4405-a177-7e486dc1ddaa',
                    'f6ca9085-8c2b-4565-93d0-813c223e369f',
                    '11e9d4f4-8c2b-4763-b4a3-bc421fa80764',
                    '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                    '07d160dc-a5ef-4164-8268-98e6a614a03d',
                    '563252f9-26fd-4405-a177-7e486dc1ddaa',
                    'f6ca9085-8c2b-4565-93d0-813c223e369f'
                ],
                'f6ca9085-8c2b-4565-93d0-813c223e369f': [
                    '11e9d4f4-8c2b-4763-b4a3-bc421fa80764'
                ]
            },
            abstractionDetail: {
                collectionB: {
                    nodes: [
                        '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                        '07d160dc-a5ef-4164-8268-98e6a614a03d',
                        '563252f9-26fd-4405-a177-7e486dc1ddaa',
                        'f6ca9085-8c2b-4565-93d0-813c223e369f'
                    ],
                    edges: [
                        '724884a3-e436-46cc-8264-2091e28145ad',
                        '153980b5-ac4a-4b70-9876-fdda4a22348a',
                        '0caff5e7-d3d2-42a6-99ee-74e36fa706b8'
                    ]
                },
                'f6ca9085-8c2b-4565-93d0-813c223e369f': {
                    nodes: [
                        '11e9d4f4-8c2b-4763-b4a3-bc421fa80764'
                    ],
                    edges: []
                }
            },
        }

        const nodes = [ '70641d88-d5cf-4a77-8c1c-803a49efbf53', '07d160dc-a5ef-4164-8268-98e6a614a03d', '563252f9-26fd-4405-a177-7e486dc1ddaa', ]
        const edges = [ '724884a3-e436-46cc-8264-2091e28145ad', '153980b5-ac4a-4b70-9876-fdda4a22348a', '0caff5e7-d3d2-42a6-99ee-74e36fa706b8' ]

        const collections = [ 'f6ca9085-8c2b-4565-93d0-813c223e369f'  ]
        const visibleCollections = [ 'f6ca9085-8c2b-4565-93d0-813c223e369f' ]
        const collectionChain = [ 'collectionB' ]

        const result = getNodesAndEdgesByCollectionId(initialState, "collectionB")
        expect(result.nodes.map(x => x.id)).toEqual(nodes)
        expect(result.edges.map(x => x.id)).toEqual(edges)
        expect(result.collections.map(x => x.id)).toEqual(collections)
        expect(result.visibleCollections.map(x => x.id)).toEqual(visibleCollections)
        expect(result.collectionChain.map(x => x.id)).toEqual(collectionChain)
    })

    test('Given one node abstraction with implicit links, give the desired state', () => {
        const initialState = {
            entities: {
                nodes: {
                    '70641d88-d5cf-4a77-8c1c-803a49efbf53': {
                        collapsed: true,
                        name: 'b',
                        modified: '1501676088237',
                        id: '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                        type: 'node',
                        created: '1501676088237',
                        collections: [
                            'collectionB'
                        ],
                        count: 0
                    },
                    '07d160dc-a5ef-4164-8268-98e6a614a03d': {
                        collapsed: true,
                        name: 'c',
                        modified: '1501676088678',
                        id: '07d160dc-a5ef-4164-8268-98e6a614a03d',
                        type: 'node',
                        created: '1501676088678',
                        collections: [
                            'collectionB'
                        ],
                        count: 0
                    },
                    '563252f9-26fd-4405-a177-7e486dc1ddaa': {
                        collapsed: true,
                        name: 'a',
                        modified: '1501676087771',
                        id: '563252f9-26fd-4405-a177-7e486dc1ddaa',
                        type: 'node',
                        created: '1501676087771',
                        collections: [
                            'collectionB'
                        ],
                        count: 0
                    },
                    'f6ca9085-8c2b-4565-93d0-813c223e369f': {
                        collapsed: true,
                        name: 'e',
                        modified: '1501676902947',
                        id: 'f6ca9085-8c2b-4565-93d0-813c223e369f',
                        type: 'collection',
                        created: '1501676902947',
                        collections: [
                            'collectionB'
                        ],
                        count: 1
                    },
                    '11e9d4f4-8c2b-4763-b4a3-bc421fa80764': {
                        collapsed: true,
                        name: 'd',
                        modified: '1501676089056',
                        id: '11e9d4f4-8c2b-4763-b4a3-bc421fa80764',
                        type: 'node',
                        created: '1501676089056',
                        collections: [
                            'f6ca9085-8c2b-4565-93d0-813c223e369f',
                            'collectionB'
                        ],
                        count: 0
                    }
                },
                edges: {
                    '153980b5-ac4a-4b70-9876-fdda4a22348a': {
                        end: '563252f9-26fd-4405-a177-7e486dc1ddaa',
                        start: '07d160dc-a5ef-4164-8268-98e6a614a03d',
                        id: '153980b5-ac4a-4b70-9876-fdda4a22348a'
                    },
                    '0caff5e7-d3d2-42a6-99ee-74e36fa706b8': {
                        end: '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                        start: '563252f9-26fd-4405-a177-7e486dc1ddaa',
                        id: '0caff5e7-d3d2-42a6-99ee-74e36fa706b8'
                    },
                    '056dfff7-a733-452b-90f7-dac223a2a2c9': {
                        end: '563252f9-26fd-4405-a177-7e486dc1ddaa',
                        start: '11e9d4f4-8c2b-4763-b4a3-bc421fa80764',
                        id: '056dfff7-a733-452b-90f7-dac223a2a2c9'
                    }
                },
                collections: {
                    collectionB: {
                        name: 'My knowledge base',
                        modified: '1501673504600',
                        id: 'collectionB',
                        type: 'root',
                        isRootCollection: true,
                        collections: [
                            'collectionB'
                        ],
                        nodes: [
                            '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                            '07d160dc-a5ef-4164-8268-98e6a614a03d',
                            '563252f9-26fd-4405-a177-7e486dc1ddaa',
                            'f6ca9085-8c2b-4565-93d0-813c223e369f',
                            '11e9d4f4-8c2b-4763-b4a3-bc421fa80764'
                        ]
                    }
                },
                collectionEdges: {}
            },
            adjacencyMap: {
                '07d160dc-a5ef-4164-8268-98e6a614a03d': [
                    '563252f9-26fd-4405-a177-7e486dc1ddaa'
                ],
                '563252f9-26fd-4405-a177-7e486dc1ddaa': [
                    '70641d88-d5cf-4a77-8c1c-803a49efbf53'
                ],
                '11e9d4f4-8c2b-4763-b4a3-bc421fa80764': [
                    '563252f9-26fd-4405-a177-7e486dc1ddaa'
                ]
            },
            reverseAdjacencyMap: {
                '563252f9-26fd-4405-a177-7e486dc1ddaa': [
                    '07d160dc-a5ef-4164-8268-98e6a614a03d',
                    '11e9d4f4-8c2b-4763-b4a3-bc421fa80764'
                ],
                '70641d88-d5cf-4a77-8c1c-803a49efbf53': [
                    '563252f9-26fd-4405-a177-7e486dc1ddaa'
                ]
            },
            edgeListMap: {
                '70641d88-d5cf-4a77-8c1c-803a49efbf53': {
                    from: [],
                    to: [
                        '0caff5e7-d3d2-42a6-99ee-74e36fa706b8'
                    ]
                },
                '07d160dc-a5ef-4164-8268-98e6a614a03d': {
                    from: [
                        '153980b5-ac4a-4b70-9876-fdda4a22348a'
                    ],
                    to: []
                },
                '563252f9-26fd-4405-a177-7e486dc1ddaa': {
                    from: [
                        '0caff5e7-d3d2-42a6-99ee-74e36fa706b8'
                    ],
                    to: [
                        '153980b5-ac4a-4b70-9876-fdda4a22348a',
                        '056dfff7-a733-452b-90f7-dac223a2a2c9'
                    ]
                },
                'f6ca9085-8c2b-4565-93d0-813c223e369f': {
                    from: [],
                    to: []
                },
                '11e9d4f4-8c2b-4763-b4a3-bc421fa80764': {
                    from: [
                        '056dfff7-a733-452b-90f7-dac223a2a2c9'
                    ],
                    to: []
                }
            },
            pathL1Cache: {},
            pathL2Cache: {},
            nodesByCollectionId: {
                collectionB: [
                    '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                    '07d160dc-a5ef-4164-8268-98e6a614a03d',
                    '563252f9-26fd-4405-a177-7e486dc1ddaa',
                    'f6ca9085-8c2b-4565-93d0-813c223e369f',
                    '11e9d4f4-8c2b-4763-b4a3-bc421fa80764'
                ],
                'f6ca9085-8c2b-4565-93d0-813c223e369f': [
                    '11e9d4f4-8c2b-4763-b4a3-bc421fa80764'
                ]
            },
            abstractionDetail: {
                collectionB: {
                    nodes: [
                        '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                        '07d160dc-a5ef-4164-8268-98e6a614a03d',
                        '563252f9-26fd-4405-a177-7e486dc1ddaa',
                        'f6ca9085-8c2b-4565-93d0-813c223e369f',
                        '11e9d4f4-8c2b-4763-b4a3-bc421fa80764'
                    ],
                    edges: [
                        '153980b5-ac4a-4b70-9876-fdda4a22348a',
                        '0caff5e7-d3d2-42a6-99ee-74e36fa706b8',
                        '056dfff7-a733-452b-90f7-dac223a2a2c9'
                    ]
                }
            },
        }

        const nodes = [ '70641d88-d5cf-4a77-8c1c-803a49efbf53', '07d160dc-a5ef-4164-8268-98e6a614a03d', '563252f9-26fd-4405-a177-7e486dc1ddaa']

        const edges = [
            {
                end: '563252f9-26fd-4405-a177-7e486dc1ddaa',
                start: '07d160dc-a5ef-4164-8268-98e6a614a03d',
                id: '153980b5-ac4a-4b70-9876-fdda4a22348a'
            },
            {
                end: '70641d88-d5cf-4a77-8c1c-803a49efbf53',
                start: '563252f9-26fd-4405-a177-7e486dc1ddaa',
                id: '0caff5e7-d3d2-42a6-99ee-74e36fa706b8'
            },
            {
                end: '563252f9-26fd-4405-a177-7e486dc1ddaa',
                start: 'f6ca9085-8c2b-4565-93d0-813c223e369f',
                id: '056dfff7-a733-452b-90f7-dac223a2a2c9'
            }
        ]


        const collections = [ 'f6ca9085-8c2b-4565-93d0-813c223e369f'  ]
        const visibleCollections = [ 'f6ca9085-8c2b-4565-93d0-813c223e369f' ]
        const collectionChain = [ 'collectionB' ]

        const result = getNodesAndEdgesByCollectionId(initialState, "collectionB")
        expect(result.nodes.map(x => x.id)).toEqual(nodes)
        expect(result.edges).toEqual(edges)
        expect(result.collections.map(x => x.id)).toEqual(collections)
        expect(result.visibleCollections.map(x => x.id)).toEqual(visibleCollections)
        expect(result.collectionChain.map(x => x.id)).toEqual(collectionChain)
    })

    // test('Given one node abstraction with implicit links, give the desired state', () => {

    // })
})

