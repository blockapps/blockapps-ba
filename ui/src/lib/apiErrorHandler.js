export function handleApiError(response) {
  return new Promise(function(resolve,reject){
    if(!response.ok) {
      response.text().then(function(text){
        reject(new Error(JSON.parse(text).error));
      })
    }
    else {
      resolve(response);
    }
  })
}
