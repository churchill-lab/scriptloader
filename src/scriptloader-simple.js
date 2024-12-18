/* 
This function loads scripts in order, one after the other.
*/
function scriptloader(scripts, callback) {
    let index = 0;

    function loadNextScript() {
        if (index < scripts.length) {
            const script = document.createElement('script');
            script.src = scripts[index];
            script.type = 'text/javascript';
            script.onload = () => {
                console.log(`Loaded script: ${scripts[index]}`);
                index++;
                loadNextScript();
            };
            script.onerror = () => {
                console.error(`Failed to load script: ${scripts[index]}`);
                index++;
                loadNextScript(); // Continue loading other scripts even if one fails
            };
        
            document.head.appendChild(script);
        } else {
            if (callback) {
                callback();
            }
        }
    }
    loadNextScript();
}