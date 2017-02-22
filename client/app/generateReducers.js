import schemas from './schemas'

// const { actions, reducers } = generateReducers([
//     schemas.NODE,
//     schemas.EDGE,
//     schemas.COLLECTION,
//     schemas.COLLECTION_EDGE,
// ]) 

function getDefaultActionTypes(schema) {
    const mainName = schema._key.toUpperCase()
    const pluralName = schema._key.toUpperCase()
    return [
        `GET_${mainName}_REQUEST`, `GET_${mainName}_SUCCESS`, `GET_${mainName}_FAILURE`,
        `CREATE_${mainName}_REQUEST`, `CREATE_${mainName}_SUCCESS`, `CREATE_${mainName}_FAILURE`,
        `UPDATE_${mainName}_REQUEST`, `UPDATE_${mainName}_SUCCESS`, `UPDATE_${mainName}_FAILURE`,
        `DELETE_${mainName}_REQUEST`, `DELETE_${mainName}_SUCCESS`, `DELETE_${mainName}_FAILURE`,
    ]
}

function getDefaultReducers(defaultActions) {
    const mainName = schema._key.toUpperCase()
    const pluralName = schema._key.toUpperCase()

    return (state={}, action) => {
        switch(action.type) {
            case defaultActions[2]:
            case defaultActions[5]:
            case defaultActions[8]:
            case defaultActions[11]:
                // handle failure
                return state

            default:
                if (action.response && action.response.entities && action.response.entities[mainName]) {
                    return _.merge({}, state, action.response.entities[mainName])
                }
        }
    }

}

function handleDefault() {
    return (state={}, action) => {
        switch(action.type) {
            
        }
    }
}

function generateReducers(schemas=[]) {
    // 1. create a graph-representation of the dependencies between the passed schemas.
    // 2. create action handlers for all normal actions, for example:
    // * CREATE_NODE_SUCCESS, UPDATE_NODE_SUCCESS, etc..
    // 3. create action handlers to handle all dependencies between reducers


    // generate the default actions types for every entity in the schema
    // const defaultActionTypes = schemas.map(getDefaultActionTypes)

    // const defaultReducers = defaultActionTypes.map(getDefaultReducers) 
    // create the default reducers for every entity
}

const relations = schemas.map(schema => schema._id)

const schemaRelations = {}

schemas.forEach(schema => {

    const schemaId = schema._id

    schemaRelations[schemaId] = {}

    for (const key in schema) {
        if (!key.startsWith('_') && Object.hasOwnProperty.call(schema, key)) {
            // got a schema
            if (typeof schema[key] === 'ArraySchema') {
                /*
                 * When deleting item, remove from arrayEntry
                */
                const itemSchema = schema[key].__itemSchema
                const itemSchmaKey = itemSchema._id
                schemaRelations[schemaId][itemSchemaKey] = {
                    id: itemSchemaKey,
                    type: 'array',
                    actionType: `ADD_${id}_TO_${schemaId}`,
                    
                }

            } else if (typeof schema[key] === 'EntitySchema') {
                //

            }
            
            schemaRelations[schemaId][]
        }
    }
})




const schemaRelations = {
    'node': {
        id: 'node',
        plural: 'nodes',
        actionKey: 'nodeId',
        oneToManyRelations: [
            {
                id: 'edge',
                reverseField: 'from',
                actionKey: 'fromId',
                name: 'fromEdges',
                removeActionType: 'REMOVE_EDGE_SUCCESS'
            },
            {
                id: 'edge',
                reverseField: 'to',
                actionKey: 'toId',
                name: 'toEdges',
                removeActionType: 'REMOVE_EDGE_SUCCESS'
            },
        ],
        manyToManyRelations: [
            {
                id: 'collection',
                type: 'm2m',
                actionKey: 'collectionId'
                addActionType: 'ADD_NODE_TO_COLLECTION_SUCCESS',
                removeActionType: 'REMOVE_NODE_FROM_COLLECTION',
            },
        ]
    },
    'collection': {
        id: 'collection',
        plural: 'collections',
        oneToManyRelations: [
            {
                id: 'collectionEdge',
                actionKey: 'collectionEdgeId'
            }
        ],
        manyToManyRelations: [
            {
                id: 'node',
                actionKey: 'nodeId'
            },
        ]
    },
    'edge': {
        id: 'edge',
        plural: 'edges',
        relations: [
            {
                id: 'node',
                name: 'from',
                actionKey: 'fromId'
                type: 'fk',
                onDelete: 'cascade',
                removeActionType: 'REMOVE_NODE_SUCCESS',
            },
            {
                id: 'node',
                name: 'to',
                actionKey: 'toId'
                type: 'fk',
                onDelete: 'cascade',
                removeActionType: 'REMOVE_NODE_SUCCESS',
            }
        ]
    },
    'collectionEdge': {
        id: 'collectionEdge',
        plural: 'collectionEdges',
        relations: [
            {
                id: 'collection',
                name: 'from',
                type: 'fk',
                onDelete: 'cascade',
            },
            {
                id: 'collection',
                name: 'to',
                type: 'fk',
                onDelete: 'cascade',
            }
        ]
    },
}


const createRootReducer = (schemaRelations, initialState={}) => {
    const schemaReducers = {}

    _.forEach(schemaRelations, (schemaRelation, id) => {
        schemaReducers[id] = createReducer(schemaRelation)
    })

    return (state={}, action) => {
        entities: {
            
        },
    }
}

function createReducer(schemaRelation) {
    const { id, pluralName } = schemaRelation

    return (state={}, action, globalState) => {
        switch(action.type) {
            /*
             * first the default action types
            */

            schemaRelation.relations.forEach(relation) {
                /*
                 * A direct relation A => B
                */
                if (action.type === relation.removeActionType) {

                    const actionKeyId = action[relation.actionKey]

                    if (relation.onDelete === 'cascade') {
                        // delete the entity being pointed to as well
                        // TODO: always store the reverse relation aswell, so cascade delete is easier - 2016-09-10
                        // TODO: problem: need relation's reducer state in here - 2016-09-10
                        // also, need to know at what key to store the reverse relation
                        return _.pickBy(state, (entity, id) => (
                            !(actionKeyId === entity[relation.name])
                        ))
                    }
                    // else just nullify the foreign key
                    return _.reduce(state, (res, entity, id) => {
                        if (!actionKeyId === entity[relation.name]) return state
                        return {
                            ...state,
                            [id]: {
                                ...state[id],
                                [relation.name]: null 
                            }
                        }
                    }, state)
                }
            }
            // TODO: handle OneToManyRelations and ManyToOneRelations separately - 2016-09-14
            schemaRelation.oneToManyRelations.forEach(relation) {
                /*
                 * A => arrayOf(B)
                 * ex: remove edge from node list
                */
                if (action.type === relation.removeActionType) {
                    // TODO: need edge's reverse relation here - 2016-09-14
                    const actionKeyId = action[relation.actionKey]
                    const reverseFieldId = globalState.entities[relation.id][action[actionKey]][reverseField]
                    return {
                        ...state,
                        [reverseFieldId]: {
                            ...state[reverseFieldId],
                            _.without(state[reverseFieldId][name], actionKeyId)
                        }
                    }
                }
            }


            case defaultActions[2]:
            case defaultActions[5]:
            case defaultActions[8]:
            case defaultActions[11]:
                // handle failure
                return state

            default:
                if (action.response && action.response.entities && action.response.entities[mainName]) {
                    return _.merge({}, state, action.response.entities[mainName])
                }
        }
    }
}


console.log(schemas);
