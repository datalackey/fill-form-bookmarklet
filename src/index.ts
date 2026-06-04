import { isReactForm } from './detect.js';

(function () {
  if (isReactForm()) {
    alert('This form appears to be built with React. Not supported in this version.');
    return;
  }
  alert('Hello from form-fill-bookmarklet! No React detected.');
})();
