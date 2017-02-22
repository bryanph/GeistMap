
import fetch from 'isomorphic-fetch';

export default function enhancedFetch(url, options={}) {
   options.headers = Object.assign({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
   }, options.headers);

   options.credentials= 'same-origin'

   console.log(options.headers);
   if(typeof options.body !== 'string') {
      options.body = JSON.stringify(options.body);
   }
   return fetch(url, options)
      .then(response =>
            response.json().then(json => ({ json, response }))
      ).then(({ json, response }) => {
           if (!response.ok) {
              return Promise.reject(json)
           }

           return json
      })
}


