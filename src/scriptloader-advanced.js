/* 
This function loads scripts in order, one after the other.
*/
function scriptloader(scripts, callback, options = {}) {
    const {
        timeout = 10000,
        retryAttempts = 2,
        retryDelay = 1000,
        onProgress,
        async = true,
        defer = true
    } = options;

    let index = 0;
    const loadedScripts = new Set();
    const failedScripts = new Map();

    function loadNextScript(retryCount = 0) {
        if (index >= scripts.length) {   
            const result = {
                success: loadedScripts,
                failed: Array.from(failedScripts.entries())
            };

            // Execute callback if provided
            if (callback) {
                callback(result);
            }

            // Resolve or reject the promise
            if (failedScripts.size === 0) {
                promiseResolve(result);
            } else {
                promiseReject(result);
            }
            return;
        }

        const currentScript = scripts[index];
        const script = document.createElement('script');
    
        script.src = currentScript;
        script.type = 'text/javascript';
        script.async = async;
        script.defer = defer;

        let timeoutId;

        const cleanup = () => {
            clearTimeout(timeoutId);
            script.onload = script.onerror = null;
        };

        const handleSuccess = () => {
            cleanup();
            loadedScripts.add(currentScript);
            onProgress?.({
                loaded: loadedScripts.size,
                total: scripts.length,
                current: currentScript
            });
            index++;
            loadNextScript();
        };

        const handleError = () => {
            cleanup();
            if (retryCount < retryAttempts) {
                setTimeout(() => {
                    loadNextScript(retryCount + 1);
                }, retryDelay);
            } else {
                failedScripts.set(currentScript, `Failed after ${retryAttempts} attempts`);
                index++;
                loadNextScript();
            }
        };

        timeoutId = setTimeout(() => {
            handleError();
        }, timeout);

        script.onload = handleSuccess;
        script.onerror = handleError;

        document.head.appendChild(script);
    }

    // Create promise handlers
    let promiseResolve, promiseReject;
    const promise = new Promise((resolve, reject) => {
        promiseResolve = resolve;
        promiseReject = reject;
    });

    loadNextScript();
    return promise;

    
}