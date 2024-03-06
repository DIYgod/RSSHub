import type { FC } from 'hono/jsx';

import { config } from '@/config';
import { gitHash, gitDate } from '@/utils/git-hash';
import { getDebugInfo } from '@/utils/debug-info';

const startTime = Date.now();

const Layout: FC = (props) => (
    <html>
        <head>
            <title>Welcome to RSSHub!</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                {`
                details::-webkit-scrollbar {
                    width: 0.25rem;
                }
                details::-webkit-scrollbar-thumb {
                    border-radius: 0.125rem;
                    background-color: #e4e4e7;
                }
                details::-webkit-scrollbar-thumb:hover {
                    background-color: #a1a1aa;
                }`}
            </style>
        </head>
        <body className="antialiased text-zinc-700">{props.children}</body>
    </html>
);

const Index: FC<{ debugQuery: string | undefined }> = ({ debugQuery }) => {
    const debug = getDebugInfo();

    const showDebug = !config.debugInfo || config.debugInfo === 'false' ? false : config.debugInfo === 'true' || config.debugInfo === debugQuery;
    const { disallowRobot, nodeName, cache } = config;

    const duration = Date.now() - startTime;

    const info = {
        showDebug,
        disallowRobot,
        debug: [
            ...(nodeName
                ? [
                      {
                          name: 'Node Name',
                          value: nodeName,
                      },
                  ]
                : []),
            ...(gitHash
                ? [
                      {
                          name: 'Git Hash',
                          value: (
                              <a className="underline" href={`https://github.com/DIYgod/RSSHub/commit/${gitHash}`}>
                                  {gitHash}
                              </a>
                          ),
                      },
                  ]
                : []),
            ...(gitDate
                ? [
                      {
                          name: 'Git Date',
                          value: gitDate.toUTCString(),
                      },
                  ]
                : []),
            {
                name: 'Cache Duration',
                value: cache.routeExpire + 's',
            },
            {
                name: 'Request Amount',
                value: debug.request,
            },
            {
                name: 'Request Frequency',
                value: ((debug.request / (duration / 1000)) * 60).toFixed(3) + ' times/minute',
            },
            {
                name: 'Cache Hit Ratio',
                value: debug.request ? ((debug.hitCache / debug.request) * 100).toFixed(2) + '%' : 0,
            },
            {
                name: 'ETag Matched Ratio',
                value: debug.request ? ((debug.etag / debug.request) * 100).toFixed(2) + '%' : 0,
            },
            {
                name: 'Health',
                value: debug.request ? ((1 - debug.error / debug.request) * 100).toFixed(2) + '%' : 0,
            },
            {
                name: 'Uptime',
                value: (duration / 3_600_000).toFixed(2) + ' hour(s)',
            },
            {
                name: 'Hot Routes',
                value: Object.keys(debug.routes)
                    .sort((a, b) => debug.routes[b] - debug.routes[a])
                    .slice(0, 30)
                    .map((route) => (
                        <>
                            {debug.routes[route]} {route}
                            <br />
                        </>
                    )),
            },
            {
                name: 'Hot Paths',
                value: Object.keys(debug.paths)
                    .sort((a, b) => debug.paths[b] - debug.paths[a])
                    .slice(0, 30)
                    .map((path) => (
                        <>
                            {debug.paths[path]} {path}
                            <br />
                        </>
                    )),
            },
            {
                name: 'Hot Error Routes',
                value: Object.keys(debug.errorRoutes)
                    .sort((a, b) => debug.errorRoutes[b] - debug.errorRoutes[a])
                    .slice(0, 30)
                    .map((route) => (
                        <>
                            {debug.errorRoutes[route]} {route}
                            <br />
                        </>
                    )),
            },
            {
                name: 'Hot Error Paths',
                value: Object.keys(debug.errorPaths)
                    .sort((a, b) => debug.errorPaths[b] - debug.errorPaths[a])
                    .slice(0, 30)
                    .map((path) => (
                        <>
                            {debug.errorPaths[path]} {path}
                            <br />
                        </>
                    )),
            },
        ],
    };

    return (
        <Layout>
            <div
                className="pointer-events-none absolute w-full h-screen"
                style={{
                    backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAzMiAzMicgd2lkdGg9JzMyJyBoZWlnaHQ9JzMyJyBmaWxsPSdub25lJyBzdHJva2U9J3JnYigxNSAyMyA0MiAvIDAuMDQpJz48cGF0aCBkPSdNMCAuNUgzMS41VjMyJy8+PC9zdmc+')`,
                    maskImage: 'linear-gradient(transparent, black, transparent)',
                }}
            ></div>
            <div className="w-full h-screen flex items-center justify-center flex-col space-y-4">
                <img src="/logo.png" alt="RSSHub" width="100" loading="lazy" />
                <h1 className="text-4xl font-bold">
                    Welcome to <span className="text-[#F5712C]">RSSHub</span>!
                </h1>
                <p className="text-zinc-500">If you see this page, the RSSHub is successfully installed and working.</p>
                <p className="text-xl font-medium text-zinc-600">Everything is RSSible</p>
                <div className="font-bold space-x-4 text-sm">
                    <a target="_blank" href="https://docs.rsshub.app">
                        <button className="text-white bg-[#F5712C] hover:bg-[#DD4A15] py-2 px-4 rounded-full">View Docs</button>
                    </a>
                    <a target="_blank" href="https://github.com/DIYgod/RSSHub">
                        <button className="bg-zinc-200 hover:bg-zinc-300 py-2 px-4 rounded-full">View on GitHub</button>
                    </a>
                    <a target="_blank" href="https://docs.rsshub.app/support" className="text-[#F5712C]">
                        <button className="text-white bg-red-500 hover:bg-red-600 py-2 px-4 rounded-full">❤️ Sponsor</button>
                    </a>
                </div>
                {info.showDebug ? (
                    <details className="text-xs w-96 !mt-8 max-h-[400px] overflow-auto">
                        <summary className="text-sm cursor-pointer">Debug Info</summary>
                        {info.debug.map((item) => (
                            <div class="debug-item my-3 pl-8">
                                <span class="debug-key w-32 text-right inline-block mr-2">{item.name}: </span>
                                <span class="debug-value inline-block break-all align-top">{item.value}</span>
                            </div>
                        ))}
                    </details>
                ) : null}
            </div>
            <div className="absolute bottom-10 text-center w-full text-sm font-medium space-y-2">
                <p className="space-x-4">
                    <a target="_blank" href="https://github.com/DIYgod/RSSHub">
                        <img className="inline" src="https://icons.ly/github/_/fff" alt="github" width="20" height="20" />
                    </a>
                    <a target="_blank" href="https://t.me/rsshub">
                        <img className="inline" src="https://icons.ly/telegram" alt="telegram group" width="20" height="20" />
                    </a>
                    <a target="_blank" href="https://t.me/awesomeRSSHub">
                        <img className="inline" src="https://icons.ly/telegram" alt="telegram channel" width="20" height="20" />
                    </a>
                    <a target="_blank" href="https://twitter.com/intent/follow?screen_name=_RSSHub" className="text-[#F5712C]">
                        <img className="inline" src="https://icons.ly/twitter" alt="github" width="20" height="20" />
                    </a>
                </p>
                <p className="!mt-6">
                    Please consider{' '}
                    <a target="_blank" href="https://docs.rsshub.app/support" className="text-[#F5712C]">
                        sponsoring
                    </a>{' '}
                    to help keep this open source project alive.
                </p>
                <p>
                    Made with ❤️ by{' '}
                    <a target="_blank" href="https://diygod.cc" className="text-[#F5712C]">
                        DIYgod
                    </a>{' '}
                    and{' '}
                    <a target="_blank" href="https://github.com/DIYgod/RSSHub/graphs/contributors" className="text-[#F5712C]">
                        Contributors
                    </a>{' '}
                    under MIT License.
                </p>
            </div>
        </Layout>
    );
};

export default Index;
