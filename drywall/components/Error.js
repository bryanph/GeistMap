import React, { PropTypes } from 'react'

export const ValidationErrors = (props) => {
  const errors = props.errors

  if (!errors) {
    return <noscipt />
  }

  const fields = Object.keys(errors)

  if (!fields.length) {
    return <noscript />
  }

  const errorList = fields.map(field => (
    <li>invalid field {field}: {errors[field]}</li>
  ))

  return (
    <div className="panel error">
      <h5>Errors were found!</h5>
      <ul>
        { errorList }
      </ul>
    </div>
  )
}

export const RenderErrors = (props) => {
  const errors = props.errors

  if (!errors || !errors.length) {
    return <noscript />
  }

  let errorList = errors.map(error => (
    <li>{error}</li>
  ))

  return (
    <ul>
      {errorList}
    </ul>
  )
}
