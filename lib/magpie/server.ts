// Entry of the RSSHub server that the magpie plugin (./plugin.ts) runs as its child process.
// It is RSSHub's own server (lib/index.ts), plus a watch on the plugin host: magpie ends its
// plugin host without ending the host's children, so the server ends itself when the host is gone.

import process from 'node:process';

const exitWithHost = () => process.exit(0);

if (process.env.RSSHUB_MAGPIE_HOST) {
    const parent = process.ppid;

    // The host holds the write end of stdin and never writes to it: the end of stdin is the end of the host.
    process.stdin.on('end', exitWithHost);
    process.stdin.on('close', exitWithHost);
    process.stdin.on('error', exitWithHost);
    process.stdin.resume();

    // A child whose host was killed is given to another parent (init, launchd or a subreaper).
    setInterval(() => {
        if (process.ppid !== parent) {
            exitWithHost();
        }
    }, 5000).unref();
}

await import('@/index');
