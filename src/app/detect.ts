/**
 * Returns true if any React signal is detected on the page: a [data-reactroot]
 * element, window.__REACT_DEVTOOLS_GLOBAL_HOOK__, or __reactFiber /
 * __reactInternalInstance keys on the form element.
 */
export function isReactForm(): boolean {
    if (document.querySelector("[data-reactroot]") !== null) {
        return true;
    }
    if (
        typeof (window as Window & { __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown })
            .__REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined"
    ) {
        return true;
    }
    const form = document.querySelector("form");
    if (form !== null) {
        const hasReactFiber = Object.keys(form).some(function (key) {
            return key.startsWith("__reactFiber") || key.startsWith("__reactInternalInstance");
        });
        if (hasReactFiber) {
            return true;
        }
    }
    return false;
}

/**
 * Returns true when the bookmarklet is running inside an iframe by comparing
 * window.self to window.top; a cross-origin SecurityError is treated as
 * confirmation of being framed.
 */
export function isInsideIframe(): boolean {
    try {
        return window.self !== window.top;
    } catch {
        // Cross-origin access to window.top throws — which itself means we are framed.
        return true;
    }
}
