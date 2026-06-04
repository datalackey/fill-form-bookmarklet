export function isReactForm(): boolean {
  if (document.querySelector('[data-reactroot]') !== null) {
    return true;
  }
  if (typeof (window as Window & { __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown }).__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined') {
    return true;
  }
  const form = document.querySelector('form');
  if (form !== null) {
    const hasReactFiber = Object.keys(form).some(function(key) {
      return key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance');
    });
    if (hasReactFiber) {
      return true;
    }
  }
  return false;
}
