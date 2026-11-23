// @ts-check
// magpie's page frame can't fetch anything (connect-src 'none'): all it can do is go to the
// RSSHub server the plugin runs. In a browser on another computer (`magpie web`), magpie gives
// the server's address on its own (magpie.service); in the desktop window it is 127.0.0.1.
void (async () => {
    let port = 1200;
    let service = '';
    try {
        await window.magpie?.ready;
        // the plugin's options, where the port is when the user moved it
        // oxlint-disable-next-line eslint-js/no-restricted-syntax -- magpie's bridge, not cheerio
        const options = await window.magpie?.options.get();
        const p = Number(options?.port);
        if (p > 0) {
            port = p;
        }
        service = window.magpie?.service ?? '';
    } catch {
        // an older magpie: the defaults
    }
    const target = service || `http://127.0.0.1:${port}/`;

    // a server still starting refuses the frame; say so, and offer to try again
    setTimeout(() => {
        const status = /** @type {HTMLElement} */ (document.querySelector('#status'));
        status.textContent = `RSSHub isn't answering at ${service ? 'its address' : `127.0.0.1:${port}`} yet.`;
        const retry = document.createElement('button');
        retry.textContent = 'Try again';
        retry.addEventListener('click', () => location.reload());
        status.after(retry);
    }, 6000);
    location.replace(target);
})();
