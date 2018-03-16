import {
    getNodesAndEdgesByCollectionId,
} from './index.js'

import update from 'immutability-helper'
const uuidV4 = require('uuid/v4');

describe('getNodesAndEdgesByCollectionId', () => {
    /*
     * Test the abstraction selector works properly
     */
    test('Test a complex example', () => {

        const initialState = {
            entities: {
                nodes: {
                    ["TEST__RootParent"]: {
                        "isRootCollection": true,
                        "created": 1503389225848,
                        "name": "My Knowledge Base",
                        "modified": 1503389225848,
                        "id": "TEST__RootParent",
                        "type": "root",
                        "collections": [ ],
                        "collapsed": true,
                    },
                    ["TEST__Root"]: {
                        "created": 1503389225848,
                        "name": "My Knowledge Base",
                        "modified": 1503389225848,
                        "id": "TEST__Root",
                        "type": "collection",
                        "collections": [ "TEST__RootParent" ],
                        "children": [ "TEST__A", "TEST__B", "TEST__Root_x" ],
                        "collapsed": true,
                    },
                    "TEST__A": {
                        "created": 1503389225848,
                        "name": "A",
                        "modified": 1503389225848,
                        "id": "TEST__A",
                        "type": "collection",
                        "collections": [ "TEST__Root", "TEST__B" ],
                        "children": [ "TEST__A_x", "TEST__A_y" ],
                        "collapsed": true,
                    },
                    "TEST__B": {
                        "created": 1503389225848,
                        "name": "B",
                        "modified": 1503389225848,
                        "id": "TEST__B",
                        "type": "collection",
                        "collections": [ "TEST__Root" ],
                        "children": [ "TEST__B_x" ],
                        "collapsed": true,
                    },
                    "TEST__Root_x": {
                        "created": 1503389225848,
                        "name": "Root_x",
                        "modified": 1503389225848,
                        "id": "TEST__Root_x",
                        "type": "node",
                        "collections": [ "TEST__Root" ],
                        "collapsed": true,
                    },
                    "TEST__A_x": {
                        "created": 1503389225848,
                        "name": "A_x",
                        "modified": 1503389225848,
                        "id": "TEST__A_x",
                        "type": "node",
                        "collections": [ "TEST__A", ],
                        "collapsed": true,
                    },
                    "TEST__A_y": {
                        "created": 1503389225848,
                        "name": "A_y",
                        "modified": 1503389225848,
                        "id": "TEST__A_y",
                        "type": "node",
                        "collections": [ "TEST__A" ],
                        "collapsed": true,
                    },
                    "TEST__B_x": {
                        "created": 1503389225848,
                        "name": "B_x",
                        "modified": 1503389225848,
                        "id": "TEST__B_x",
                        "type": "node",
                        "collections": [ "TEST__B" ],
                        "collapsed": true,
                    },
                },
                edges: {
                    ["TEST__A_x-B_x"]: {
                        end: "TEST__B_x",
                        start: "TEST__A_x",
                        id: "TEST__A_x-B_x",
                    },
                    ["TEST__A_y-B"]: {
                        end: "TEST__B",
                        start: "TEST__A_y",
                        id: "TEST__A_y-B",
                    },
                },
            },

            edgeListMap: {
                "TEST__A_x": {
                    from: [ "TEST__A_x-B_x" ],
                    to: [],
                },
                "TEST__B_x": {
                    from: [],
                    to: [ "TEST__A_x-B_x" ],
                },
                "TEST__A_y": {
                    from: [ "TEST__A_y-B" ],
                    to: [],
                },
                "TEST__B": {
                    to: [ "TEST__A_y-B" ],
                    from: [],
                },
            },
        }

        const result = getNodesAndEdgesByCollectionId(initialState, {
            collectionId: "TEST__Root"
        })

        expect(result).toMatchObject({
            nodes: [ 
                { 
                    created: 1503389225848,
                    name: 'A',
                    modified: 1503389225848,
                    id: 'TEST__A',
                    type: 'collection',
                    "collections": [ "TEST__Root", "TEST__B" ],
                    collapsed: true 
                },
                { 
                    created: 1503389225848,
                    name: 'B',
                    modified: 1503389225848,
                    id: 'TEST__B',
                    type: 'collection',
                    "collections": [ "TEST__Root" ],
                    collapsed: true 

                },
                {
                    created: 1503389225848,
                    name: 'Root_x',
                    modified: 1503389225848,
                    id: 'TEST__Root_x',
                    type: 'node',
                    "collections": [ "TEST__Root" ],
                } ,
            ],
            edges: [
                { end: 'TEST__B', start: 'TEST__A', id: 'TEST__A_x-B_x' },
                { end: 'TEST__B', start: 'TEST__A', id: 'TEST__A_y-B' },
            ],
        })

        const withExpandedA = update(initialState, {
            "entities": { "nodes": {
                "TEST__A": { $merge: { collapsed: false } }
            }}
        })

        const result2 = getNodesAndEdgesByCollectionId(withExpandedA, {
            collectionId: "TEST__Root",
        })

        expect(result2).toMatchObject({
            nodes: [
                {
                    created: 1503389225848,
                    name: 'A_x',
                    modified: 1503389225848,
                    id: 'TEST__A_x',
                    type: 'node',
                    "collections": [ "TEST__A", ],
                },
                {
                    created: 1503389225848,
                    name: 'A_y',
                    modified: 1503389225848,
                    id: 'TEST__A_y',
                    type: 'node',
                    "collections": [ "TEST__A" ],
                },
                {
                    created: 1503389225848,
                    name: 'B',
                    modified: 1503389225848,
                    id: 'TEST__B',
                    type: 'collection',
                    "collections": [ "TEST__Root" ],
                    collapsed: true
                },
                {
                    created: 1503389225848,
                    name: 'Root_x',
                    modified: 1503389225848,
                    id: 'TEST__Root_x',
                    type: 'node',
                    "collections": [ "TEST__Root" ],
                },
            ],
            edges: [
                {
                    end: 'TEST__B',
                    start: 'TEST__A_x',
                    id: 'TEST__A_x-B_x'
                },
                {
                    end: 'TEST__B',
                    start: 'TEST__A_y',
                    id: 'TEST__A_y-B'
                },
            ],
        })


        const withExpandedB = update(initialState, {
            "entities": { "nodes": {
                "TEST__B": { $merge: { collapsed: false } }
            }}
        })

        const result3 = getNodesAndEdgesByCollectionId(withExpandedB, {
            collectionId: "TEST__Root",
        })


        expect(result3).toMatchObject({
            nodes: [
                {
                    created: 1503389225848,
                    name: 'A',
                    modified: 1503389225848,
                    id: 'TEST__A',
                    type: 'collection',
                    "collections": [ "TEST__Root", "TEST__B" ],
                    collapsed: true,
                },
                {
                    created: 1503389225848,
                    name: 'B_x',
                    modified: 1503389225848,
                    id: 'TEST__B_x',
                    type: 'node',
                    "collections": [ "TEST__B" ],
                },
                {
                    created: 1503389225848,
                    name: 'Root_x',
                    modified: 1503389225848,
                    id: 'TEST__Root_x',
                    type: 'node',
                    "collections": [ "TEST__Root" ],
                },
            ],
            edges: [
                {
                    end: 'TEST__B_x',
                    start: 'TEST__A',
                    id: 'TEST__A_x-B_x'
                }],
        })


        const withExpandedAB = update(initialState, {
            "entities": { "nodes": {
                "TEST__A": { $merge: { collapsed: false } },
                "TEST__B": { $merge: { collapsed: false } },
            }}
        })

        const result4 = getNodesAndEdgesByCollectionId(withExpandedAB, {
            collectionId: "TEST__Root",
        })

        expect(result4).toMatchObject({
            nodes: [
                {
                    created: 1503389225848,
                    name: 'A_x',
                    modified: 1503389225848,
                    id: 'TEST__A_x',
                    type: 'node',
                    "collections": [ "TEST__A", ],
                },
                {
                    created: 1503389225848,
                    name: 'A_y',
                    modified: 1503389225848,
                    id: 'TEST__A_y',
                    type: 'node',
                    "collections": [ "TEST__A" ],
                },
                {
                    created: 1503389225848,
                    name: 'B_x',
                    modified: 1503389225848,
                    id: 'TEST__B_x',
                    type: 'node',
                    "collections": [ "TEST__B" ],
                },
                {
                    created: 1503389225848,
                    name: 'Root_x',
                    modified: 1503389225848,
                    id: 'TEST__Root_x',
                    type: 'node',
                    "collections": [ "TEST__Root" ],
                },
            ],
            edges: [
                {
                    end: 'TEST__B_x',
                    start: 'TEST__A_x',
                    id: 'TEST__A_x-B_x'
                }
            ],
        })
    })

    //     test('Given one node abstraction with one node in it and explicit links, give the desired state', () => {

    //     })

    //     test('Given one node abstraction with implicit links, give the desired state', () => {

    //     })

    // test('Given one node abstraction with implicit links, give the desired state', () => {

    // })
})

