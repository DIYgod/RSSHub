import { Worker } from 'node:worker_threads';

import { load } from 'cheerio';

export const filename = import.meta.filename;

const MAX_MEMORY = 512 * 1024 * 1024;

// entry point of the child process forked by `mercury.ts`, which also imports this module for its path
if (process.argv[1] === filename) {
    // running out of heap aborts the process, which may leave a core dump behind, so stop well before that happens
    new Worker(`setInterval(() => process.memoryUsage.rss() > ${MAX_MEMORY} && process.kill(process.pid, 'SIGKILL'), 100)`, { eval: true }).unref();

    process.on('message', async ({ link, html }: { link: string; html: string }) => {
        let result;
        try {
            const { default: Parser } = await import('@jocmp/mercury-parser');
            // the child has no request rewriter, so Mercury must not fetch the following pages by itself
            result = await Parser.parse(link, { html: load(html).html(), fetchAllPages: false });
        } catch {
            // no-empty
        }
        process.send?.({ result });
    });
}
