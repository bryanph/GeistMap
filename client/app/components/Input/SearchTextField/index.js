import React, { PropTypes } from 'react'
import { debounced, InputText } from '../'
import './styles.css'

// used for search
export const SearchTextField = (props) => (
    <InputText {...props} className={props.className || "searchTextField-input"} />
)
// export const SearchTextField500 = debounced(SearchTextField, 100)
export const SearchTextField500 = SearchTextField
