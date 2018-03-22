'use strict';
const Async = require('async');
const _ = require('lodash')
const uuidV4 = require('uuid/v4');
const promptly = require('promptly');
const neo4j = require('@bryanph/neo4j-driver').v1
const elasticsearch = require('elasticsearch')

const config = require('../../server/config/config.js')
const authConfig = require('../../server/config/auth.js')

const mongoose = require('mongoose')
mongoose.Promise = global.Promise; // use ES6 promises

const mongoDb = mongoose.createConnection(config.database.url);
const app = { db: mongoDb } // mock express app object for now...

const driver = neo4j.driver(
    config.neo4j.url,
    neo4j.auth.basic(config.neo4j.user, config.neo4j.password),
    {
        convertToString: true
    }
)
const session = driver.session();
const session2 = driver.session();
const session3 = driver.session();

const es = elasticsearch.Client({
    host: 'localhost:9200',
    log: [{
        type: 'stdio',
        levels: ['error', 'warning']
    }]
})

const {
    EditorState,
    Entity,
    DefaultDraftBlockRenderMap,
    convertToRaw,
    convertFromRaw
} = require('draft-js');

const createNodeApi = require('../../server/api/private/Node')

mongoDb.on('error', (error) => console.error('mongoose connection error: ' + error.message));
mongoDb.once('open', () => start().catch(e => console.log(e)))

async function start() {

    require('full-auth-middleware/schema/Note')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/Status')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/StatusLog')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/Category')(app, mongoose, authConfig);

    require('full-auth-middleware/schema/User')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/Admin')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/AdminGroup')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/Account')(app, mongoose, authConfig);
    require('full-auth-middleware/schema/LoginAttempt')(app, mongoose, authConfig);


    const result = await session.run(`
        MATCH (n:Node)
        WHERE n.id = { id }
        RETURN n
        `, {
            id: "9669bbe8-0c33-421a-a961-9af7cd372d77"
        })

    const parentNode = result.records[0]._fields[0].properties
    const editorState = JSON.parse(parentNode.editorState)
    const nodeTree = []


    // split between before headers and after headers
    // _.findIndex(editorState.blocks)

    let currentParent = {
        label: "NODE",
        data: {
            name: parentNode.name,
            modified: parentNode.modified,
            id: parentNode.id,
            created: parentNode.created,
            type: "parentNode",
        },
        children: [], // this will be removed later
    }

    let currentLevel = 0;
    let activeNode = currentParent;
    let stack = [ currentParent ]

    // side-links to create
    const deeplinks = []
    const surfacelinks = []

    function handleEntityRange(entityRange, parentNode) {
        const entity = editorState.entityMap[entityRange.key]

        if (entity.type === "CONTENT_LINK") {
            const textId = uuidV4()
            parentNode.textEnhancements.push({
                label: 'LINK_INLINE',
                data: {
                    offset: entityRange.offset,
                    length: entityRange.length,
                    id: textId,
                    created: currentParent.data.created,
                    modified: currentParent.data.modified,
                    type: "link_inline",

                    content: entity.data.text,
                    edgeId: entity.data.edgeId,
                    targetId: entity.data.nodeId,
                },
            })

            deeplinks.push({
                sourceId: textId,
                targetId: entity.data.nodeId,
                edgeId: uuidV4(),
            })
            surfacelinks.push({
                sourceId: currentParent.data.id,
                targetId: entity.data.nodeId,
                edgeId: uuidV4(),
            })
        } else if (entity.type === "inline-latex") {
            parentNode.textEnhancements.push({
                label: 'TEX_INLINE',
                data: {
                    offset: entityRange.offset,
                    length: entityRange.length,
                    id: uuidV4(),
                    created: currentParent.data.created,
                    modified: currentParent.data.modified,
                    type: "tex_inline",

                    content: entity.data.content,
                },
            })
        }

    }

    // TODO: handle links in all textual blocks - 2018-03-22
    // TODO: remove existing content links and just make these links - 2018-03-22
    // TODO: create unique constraints - 2018-03-22
    editorState.blocks.forEach((block, index) => {
        activeNode = stack[stack.length - 1]

        // console.log(block.type)
        /*
         * Handle header types
         */
        if (block.type === "unstyled") { 
            if (block.text === "") {
                return;
            }

            const node = {
                label: 'PARAGRAPH',
                data: {
                    content: block.text,
                    modified: currentParent.data.modified,
                    id: uuidV4(),
                    created: currentParent.data.created,
                    type: "paragraph",
                },
                textEnhancements: [],
            }
            activeNode.children.push(node)

            block.entityRanges.forEach((entityRange) => handleEntityRange(entityRange, node))

            return;
        }

        else if (block.type === "header-three") {
            const node = {
                label: 'HEADER',
                data: {
                    content: block.text,
                    modified: currentParent.data.modified,
                    id: uuidV4(),
                    created: currentParent.data.created,
                    type: "header",
                },
                children: [], // this is not saved
            }

            // if there are header-three, header-four or header-fives in the stack, pop them first
            if (currentLevel > 0) {
                _.times(currentLevel, () => { stack.pop(); currentLevel -= 1; })
                activeNode = stack[stack.length - 1]
            }

            activeNode.children.push(node)
            stack.push(node)
            currentLevel += 1;
            return;
        }
        else if (block.type === "header-four") {
            const node = {
                label: 'HEADER',
                data: {
                    content: block.text,
                    modified: currentParent.data.modified,
                    id: uuidV4(),
                    created: currentParent.data.created,
                    type: "header",
                },
                children: [], // this is not saved
            }

            // if there are header-four or header-fives in the stack, pop them first
            if (currentLevel > 1) {
                _.times(currentLevel - 1, () => { stack.pop(); currentLevel -= 1; })
                activeNode = stack[stack.length - 1]
            }

            activeNode.children.push(node)
            stack.push(node)
            currentLevel += 1;
            return;
        }
        else if (block.type === "header-five") {
            const node = {
                label: 'HEADER',
                data: {
                    content: block.text,
                    modified: currentParent.data.modified,
                    id: uuidV4(),
                    created: currentParent.data.created,
                    type: "header",
                },
                children: [], // this is not saved
            }

            // if there are header-fives in the stack, pop them first
            if (currentLevel > 2) {
                _.times(currentLevel - 2, () => { stack.pop(); currentLevel -= 1; })
                activeNode = stack[stack.length - 1]
            }

            activeNode.children.push(node)
            stack.push(node)
            currentLevel += 1;
            return;
        }
        else if (block.type === "blockquote") {
            if (block.text === "") {
                return;
            }

            const node = {
                label: 'PARAGRAPH',
                data: {
                    content: block.text,
                    modified: currentParent.data.modified,
                    id: uuidV4(),
                    created: currentParent.data.created,
                    type: "blockquote",
                },
                textEnhancements: [],
            }
            activeNode.children.push(node)

            block.entityRanges.forEach((entityRange) => handleEntityRange(entityRange, node))

            return;
        }
        else if (block.type === "code-block") {
            if (block.text === "") {
                return;
            }

            const node = {
                label: 'CODEBLOCK',
                data: {
                    content: block.text,
                    modified: currentParent.data.modified,
                    id: uuidV4(),
                    created: currentParent.data.created,
                    type: "codeblock",
                },
                textEnhancements: [],
            }
            activeNode.children.push(node)

            return;
        }
        else if (block.type === "unordered-list-item") {
            if (block.text === "") {
                return;
            }

            // if previous item is not unordered-list-item, create a unordered-list and make it the active node
            if (index-1 < 0 || editorState.blocks[index-1].type !== "unordered-list-item") {
                const list = {
                    label: 'UNORDERED_LIST',
                    data: {
                        modified: currentParent.data.modified,
                        id: uuidV4(),
                        created: currentParent.data.created,
                        type: "unordered_list",
                    },
                    children: [],
                }
                activeNode.children.push(list)
                stack.push(list);
                activeNode = list;
            }


            // if next item is not unordered-list-item, pop the stack and change active node

            // if there was a list item before, create a list node above.
            const node = {
                label: 'UNORDERED_LIST_ITEM',
                data: {
                    content: block.text,
                    modified: currentParent.data.modified,
                    id: uuidV4(),
                    created: currentParent.data.created,
                    type: "unordered_list_item",
                },
                textEnhancements: [],
            }
            activeNode.children.push(node)

            block.entityRanges.forEach((entityRange) => handleEntityRange(entityRange, node))

            // if next item is not unordered-list-item, pop the stack
            if (index+1 >= editorState.blocks.length || editorState.blocks[index+1].type !== "unordered-list-item") {
                stack.pop()
                activeNode = stack[stack.length - 1]
            }


            return;
        }
        else if (block.type === "ordered-list-item") {
            if (block.text === "") {
                return;
            }

            // if previous item is not unordered-list-item, create a unordered-list and make it the active node
            if (index-1 < 0 || editorState.blocks[index-1].type !== "ordered-list-item") {
                const list = {
                    label: 'ORDERED_LIST',
                    data: {
                        modified: currentParent.data.modified,
                        id: uuidV4(),
                        created: currentParent.data.created,
                        type: "ordered_list",
                    },
                    children: [],
                }
                activeNode.children.push(list)
                stack.push(list);
                activeNode = list;
            }

            // if there was a list item before, create a list node above.
            const node = {
                label: 'ORDERED_LIST_ITEM',
                data: {
                    content: block.text,
                    modified: currentParent.data.modified,
                    id: uuidV4(),
                    created: currentParent.data.created,
                    type: "ordered_list_item",
                },
                textEnhancements: [],
            }
            activeNode.children.push(node)

            block.entityRanges.forEach((entityRange) => handleEntityRange(entityRange, node))

            // if next item is not unordered-list-item, pop the stack
            if (index+1 >= editorState.blocks.length || editorState.blocks[index+1].type !== "ordered-list-item") {
                stack.pop()
                activeNode = stack[stack.length - 1]
            }
            return;
        }
        else if (block.type === "atomic") {
            if (block.data.type === "image") {
                const node = {
                    label: 'IMAGE',
                    uploaded: block.data.uploaded,
                    data: Object.assign({
                        src: block.data.src,
                        created: currentParent.data.created,
                        modified: currentParent.data.modified,
                        id: uuidV4(),
                        type: "image",
                    }, block.data.file)
                }
                activeNode.children.push(node)
                return;
            }
            else if (block.data.type === "video") {
                const node = {
                    label: 'VIDEO',
                    uploaded: block.data.uploaded,
                    data: Object.assign({
                        src: block.data.src,
                        created: currentParent.data.created,
                        modified: currentParent.data.modified,
                        id: uuidV4(),
                        type: "video",
                    }, block.data.file),
                }
                activeNode.children.push(node)
                return;
            }
            else if (block.data.type === "audio") {
                const node = {
                    label: 'AUDIO',
                    uploaded: block.data.uploaded,
                    data: Object.assign({
                        src: block.data.src,
                        created: currentParent.data.created,
                        modified: currentParent.data.modified,
                        id: uuidV4(),
                        type: "audio",
                    }, block.data.file),
                }
                activeNode.children.push(node)
                return;
            }
            else if (block.data.type === "latex") {
                const entity = editorState.entityMap[block.entityRanges[0].key]
                const node = {
                    label: 'TEX',
                    data: {
                        content: entity.data.content,
                        created: currentParent.data.created,
                        modified: currentParent.data.modified,
                        id: uuidV4(),
                        type: "tex",
                    },
                }
                activeNode.children.push(node)
                return;
            }
        }

        console.log("SOMETHING WAS NOT HANDLED")
    })

    function handleNode(node, parent) {
        // create the node itself
        const promises = []
        promises[0] = session.run(`
            CREATE (n:${node.label} {data})
        `, {
            data: node.data,
        })

        if (parent) {
            promises[1] = session.run(`
                MATCH (startNode), (endNode)
                WHERE startNode.id = {start} AND endNode.id = {end}
                CREATE (startNode)-[e:AbstractEdge { start: {start}, end: {end}, id: {edgeId} }]->(endNode)
            `, {
                start: node.data.id,
                end: parent.data.id,
                edgeId: uuidV4(),
            })

        }

        if (node.children && node.children.length) {
            // repeat for children
            return Promise.all(promises)
                .then(() => {
                    return Promise.all(node.children.map(child => handleNode(child, node)))
                        .then(() => {
                            // make children ordered

                            return session.run(`
                                MATCH (node)
                                WHERE node.id = {nodeId}
                                CREATE (node)<-[:CHILD_LIST]-(:CHILD_LIST_NODE { id: {nodeId} })
                            `, {
                                nodeId: node.data.id
                            }).then(() => {
                                // TODO: this should instead put the child order on the CHILD_LIST_NODE - 2018-03-22

                                session.run(`
                                    MATCH (startNode), (endNode)
                                    WHERE startNode.id = {startNode} AND endNode.id = {endNode}
                                    CREATE (startNode)<-[:CHILD_ORDER]-(endNode)
                                `, {
                                    nodeId: node.data.id
                                })
                                
                                const fullNodeList = [ node, ...node.children.slice(0, node.children.length) ]
                                return node.children.map((currentNode, index) => {
                                    const nextNode = node.children[index+1]
                                    if (!nextNode) {
                                        return Promise.resolve()
                                    }
                                    session.run(`
                                        MATCH (startNode), (endNode)
                                        WHERE startNode.id = {startNode} AND endNode.id = {endNode}
                                        CREATE (startNode)<-[:CHILD_ORDER]-(endNode)
                                    `, {
                                        startNode: currentNode.data.id,
                                        endNode: nextNode.data.id
                                    })
                                })
                            })
                        })
                })
        }
        else {
            return Promise.all(promises)
        }
    }

    await handleNode(currentParent, null)

    await Promise.all(deeplinks.map((link) => {
        return session.run(`
                MATCH (startNode), (endNode)
                WHERE startNode.id = {start} AND endNode.id = { end }
                CREATE (startNode)-[e:EDGE { start: {start}, end: {end}, id: {edgeId} }]->(endNode)
            `, {
                start: link.sourceId,
                end: link.targetId,
                edgeId: uuidV4(),
            })
    }))

    // _.forEach(surfacelinks, link => {

    // })

    process.exit(0)
}



