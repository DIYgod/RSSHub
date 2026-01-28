import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/package/:name{(@[a-z0-9-~][a-z0-9-._~]*/)?[a-z0-9-~][a-z0-9-._~]*}',
    name: 'Package',
    maintainers: ['Fatpandac'],
    categories: ['program-update'],
    example: '/npm/package/rsshub',
    radar: [
        {
            source: ['www.npmjs.com/package/:name'],
        },
    ],
    handler,
};

async function handler(ctx) {
    const name = ctx.req.param('name');
    const packageDownloadLastMonthAPI = `https://api.npmjs.org/downloads/point/last-month/${name}`; // 按月统计
    const packageDownloadLastWeekAPI = `https://api.npmjs.org/downloads/point/last-week/${name}`; // 按周统计
    const packageDownloadLastDayAPI = `https://api.npmjs.org/downloads/point/last-day/${name}`; // 按天统计
    const packageVersionAPI = `https://registry.npmjs.org/${name}`; // 包基本信息

    const downloadCountLastMonthRes = await ofetch(packageDownloadLastMonthAPI);
    const downloadCountLastWeekRes = await ofetch(packageDownloadLastWeekAPI);
    const downloadCountLastDayRes = await ofetch(packageDownloadLastDayAPI);
    const packageVersionRes = await ofetch(packageVersionAPI);

    const packageVersion = packageVersionRes.time;
    const packageVersionList = Object.keys(packageVersion)
        .map((key) => ({
            version: key,
            time: packageVersion[key],
        }))
        .toReversed();

    return {
        title: `${name} - npm`,
        link: `https://www.npmjs.com/package/${name}`,
        description: `${name} - npm`,
        item: [
            {
                title: `${name} - npm`,
                description: renderToString(
                    <>
                        <h3>Download</h3>
                        <p>Last Day: {downloadCountLastDayRes.downloads}</p>
                        <p>Last week: {downloadCountLastWeekRes.downloads}</p>
                        <p>Last month: {downloadCountLastMonthRes.downloads}</p>
                        <hr />
                        <h3>Version</h3>
                        {packageVersionList.map((version) => (
                            <p>
                                {version.version}: {version.time}
                            </p>
                        ))}
                    </>
                ),
                link: `https://www.npmjs.com/package/${name}`,
                guid: `https://www.npmjs.com/package/${name}${packageVersion.modified}`,
            },
        ],
    };
}
