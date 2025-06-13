export function deferred(f) {
  let promise;

  return {
    then(
      onfulfilled,
      onrejected
    ) {
      // Use logical OR assignment when Node.js 14.x support is dropped
      //promise ||= new Promise(resolve => resolve(f()));
      promise || (promise = new Promise(resolve => resolve(f())));
      return promise.then(
        onfulfilled,
        onrejected
      );
    },
  };
}
