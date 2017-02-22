import find from 'lodash/find'

export function getCSRFToken() {
  const elem = find(document.getElementsByTagName("meta"), (meta) => {
    return meta.name === "csrf-token"
  })

  return elem ? elem.content : null
}

export function getHeaders() {
  return {
    'x-csrf-token': getCSRFToken(),
    // 'Accept': 'application/json',
    // 'Content-Type': 'application/x-www-form-urlencoded',
  }
}

export default getHeaders
