import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://open-vsx.org';

export const route: Route = {
    path: '/extension/:namespace/:name',
    categories: ['program-update'],
    view: ViewType.Notifications,
    example: '/open-vsx/extension/redhat/java',
    parameters: {
        namespace: 'Extension namespace (publisher), can be found in the extension URL',
        name: 'Extension name, can be found in the extension URL',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['open-vsx.org/extension/:namespace/:name', 'open-vsx.org/extension/:namespace/:name/:version'],
            target: '/extension/:namespace/:name',
        },
    ],
    name: 'Extension Update',
    maintainers: ['anandghegde'],
    handler,
    description: `::: tip
For example, the URL of [Language Support for Java(TM) by Red Hat](https://open-vsx.org/extension/redhat/java) is \`https://open-vsx.org/extension/redhat/java\`, so the \`namespace\` is \`redhat\` and the \`name\` is \`java\`.
:::`,
};

async function handler(ctx) {
    const { namespace, name } = ctx.req.param();
    const limit = Number(ctx.req.query('limit')) || 20;

    const apiUrl = `${rootUrl}/api/${namespace}/${name}`;
    const [extension, versionList] = await Promise.all([ofetch(apiUrl), ofetch(`${apiUrl}/versions`, { query: { size: limit } })]);

    const items = await Promise.all(
        Object.entries(versionList.versions as Record<string, string>).map(([version, versionUrl]) =>
            cache.tryGet(versionUrl, async () => {
                const data = await ofetch(versionUrl);

                return {
                    title: data.preRelease ? `v${data.version} (pre-release)` : `v${data.version}`,
                    link: `${rootUrl}/extension/${namespace}/${name}/${version}`,
                    description: renderToString(
                        <>
                            {data.description ? <p>{data.description}</p> : null}
                            <ul>
                                {data.engines?.vscode ? <li>VS Code engine: {data.engines.vscode}</li> : null}
                                {data.files?.changelog ? (
                                    <li>
                                        <a href={data.files.changelog}>Changelog</a>
                                    </li>
                                ) : null}
                                {data.files?.download ? (
                                    <li>
                                        <a href={data.files.download}>Download .vsix</a>
                                    </li>
                                ) : null}
                            </ul>
                        </>
                    ),
                    pubDate: parseDate(data.timestamp),
                    author: data.publishedBy?.fullName || data.publishedBy?.loginName,
                };
            })
        )
    );

    return {
        title: `${extension.displayName || extension.name} - Open VSX`,
        description: extension.description,
        link: `${rootUrl}/extension/${namespace}/${name}`,
        image: extension.files?.icon,
        item: items,
    };
}
