

/*
 * Visualization Actions
*/

export const GET_VIZ = 'GET_VIZ'
export function getViz(entities) {
    return {
        type: GET_VIZ,

        entities: entities, // newly fetched entities object
    }
}

export const GET_ALL_VIZ = 'GET_ALL_VIZ'
export function getAllViz(results, entities) {
    return {
        type: GET_ALL_VIZ,

        entities: entities, // newly fetched entities object
    }
}

export const ADD_VIZ = 'ADD_VIZ'

export function addViz(id, entities) {
    return {
        type: ADD_VIZ,

        id: id, // id of viz
        entities: entities, // newly fetched entities object
        // viz: viz // newly fetched entities object
    }
}

export const UPDATE_VIZ = 'UPDATE_VIZ'

export function updateViz(id, entities, updateType) {
    return {
        type: UPDATE_VIZ,
        id: id, // id of viz
        entities: entities, // newly fetched entities object
        updateType: updateType
    }
}

export const DELETE_VIZ = 'DELETE_VIZ'

export function deleteViz(id) {
    return {
        type: DELETE_VIZ,
        id: id 
    }
}


export const SET_ACTIVE_VIZ = 'SET_ACTIVE_VIZ'

export function setActiveViz(id) {
    return {
        type: SET_ACTIVE_VIZ,
        id: id
    }
}

export const CHANGE_ORDER = 'CHANGE_ORDER'
export function changeOrder(order, reverse=false) {
    return {
        type: CHANGE_ORDER,
        orderBy: order,
        reverse: reverse
    }
}

export const UNSET_ACTIVE_VIZ = 'UNSET_ACTIVE_VIZ'

export function unsetActiveViz() {
    return {
        type: UNSET_ACTIVE_VIZ,
    }
}


export const ADD_ITEM = 'ADD_ITEM'

export function addItem(id, item) {
    /*
     * index: index of the viz
     * id: id of the viz
     * item: item object
     * result: new result array
    */
    return {
        type: ADD_ITEM,
        // index: i,
        id: id,
        item: item,
    }
}

export const REMOVE_ITEM = 'REMOVE_ITEM'

export function removeItem(id, itemIndex) {
    /*
     * index: index of the viz
     * id: id of the viz
     * itemIndex: index of the item
    */
    return {
        type: REMOVE_ITEM,
        // index: index,
        id: id,
        itemId: itemIndex,
    }
}

export const CHANGE_ITEM = 'CHANGE_ITEM'

export function changeItem(id, itemId, item, result) {
    /*
     * index: index of the viz
     * id: id of the viz
     * itemIndex: index of the item
    */
    return {
        type: CHANGE_ITEM,
        id: id,
        itemIndex: itemIndex,
        item: item,
        result: result,
    }
}

export const CHANGE_CONTEXT = 'CHANGE_CONTEXT'

export function changeContext(id, context, items) {
    /*
     * id: id of viz
     * context: new context object returned by server
     * items: new items with new results according to the context filters
    */
    return {
        type: CHANGE_CONTEXT,
        id: id,
        context: context, 
        items: items,
    }
}

export const ADD_CONTEXT = 'ADD_CONTEXT'

export function addContext(id, context, items) {
    /*
     * id: id of viz
     * context: context object returned by server
     * items: the items affected by the context change
    */
    return {
        type: ADD_CONTEXT,
        id: id,
        context: context,
        items: items,
    }
}

export const REMOVE_CONTEXT = 'REMOVE_CONTEXT'

export function removeContext(id, contextId, items) {
    /*
     * id: id of viz
     * contextId: id of the context object
     * items: the items affected by the context change
    */
    return {
        type: REMOVE_CONTEXT,
        id: id,
        contextId: contextId,
        items: items,
    }
}

export const REPLACE_CONTEXT = 'REPLACE_CONTEXT'

export function replaceContext(id, oldContextId, context, items) {
    /*
     * id: id of viz
     * contextId: id of the context object
     * context: the new context item
     * items: the items affected by the context change
    */
    return {
        type: REPLACE_CONTEXT,
        id: id,
        oldContextId: oldContextId,
        context: context,
        items: items,
    }
}



/*
 * OIPA META
*/

export const GET_CONTEXT_FILTERS = 'GET_CONTEXT_FILTERS'

export function getContextFilters(filters) {
    return {
        type: GET_CONTEXT_FILTERS,
        filters: filters
    }
}

export const GET_ITEM_FILTERS = 'GET_ITEM_FILTERS'

export function getItemFilters(entities) {
    return {
        type: GET_ITEM_FILTERS,
        entities: entities, // newly fetched entities object
        filters: entities
    }
}

/*
 * UI State
*/
export const TOGGLE_NAV = 'TOGGLE_NAV'

export function toggleNav(){
    return {
        type: TOGGLE_NAV
    }
}

export const CHANGE_LEVEL = 'CHANGE_LEVEL'

export function changeLevel(level){
    return {
        type: CHANGE_LEVEL,
        level: level,
    }
}

export const TOGGLE_MAINMENU = 'TOGGLE_MAINMENU'

export function toggleMainMenu(bool){
    return {
        type: TOGGLE_MAINMENU,
        show: bool,
    }
}

export const CHANGE_SEARCH_STRING = 'CHANGE_SEARCH_STRING'

export function changeSearchString(string){
    return {
        type: CHANGE_SEARCH_STRING,
        searchString: string,
    }
}

export const RESET_SEARCH_STRING = 'RESET_SEARCH_STRING'

export function resetSearchString() {
    return {
        type: RESET_SEARCH_STRING
    }
}

/*
Notifications
*/
export const INVALIDATE_NOTIFICATION = 'INVALIDATE_NOTIFICATION'

export function invalidateNotification() {
    return {
        type: INVALIDATE_NOTIFICATION,
    }
}


/*
Loading state
*/

export const ITEMS_LOADING = 'ITEMS_LOADING'
export const CONTEXT_LOADING = 'CONTEXT_LOADING'
export const CHART_LOADING = 'CHART_LOADING'
export const ALL_VIZ_LOADING = 'ALL_VIZ_LOADING'

export function setLoadStateItems(bool) {
    return {
        type: ITEMS_LOADING,
        show:bool,
    }
}

export function setLoadStateContext(bool) {
    return {
        type: CONTEXT_LOADING,
        show:bool,
    }
}

export function setLoadStateUpdateChart(bool) {
    return {
        type: CHART_LOADING,
        show:bool,
    }
}

export function setLoadStateAllViz(bool) {
    return {
        type: ALL_VIZ_LOADING,
        show:bool,
    }
}

