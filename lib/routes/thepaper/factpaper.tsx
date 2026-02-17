import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/factpaper/:status?',
    categories: ['new-media'],
    example: '/thepaper/factpaper',
    parameters: { status: '状态 id，可选 `1` 即 有定论 或 `0` 即 核查中，默认为 `1`' },
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
            source: ['factpaper.cn/'],
            target: '/factpaper/:status',
        },
    ],
    name: '明查',
    maintainers: ['nczitzk'],
    handler,
    url: 'factpaper.cn/',
};

async function handler(ctx) {
    const status = Number.parseInt(ctx.req.param('status') ?? '1');

    const rootUrl = 'https://www.factpaper.cn';
    const apiRootUrl = 'https://api.factpaper.cn';
    const currentUrl = `${apiRootUrl}/fact-check/front/proveList`;

    const response = await got({
        method: 'post',
        url: currentUrl,
        json: {
            pageNum: 1,
            pageSize: 20,
            status,
        },
    });

    let items = response.data.data.list.map((item) => ({
        title: item.title,
        guid: item.proveId,
        link: `${rootUrl}/detail?id=${item.proveId}`,
        pubDate: timezone(parseDate(item.publishTime), +8),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'post',
                    url: `${apiRootUrl}/fact-check/front/proveInfo`,
                    json: {
                        proveId: item.guid,
                    },
                });

                const data = detailResponse.data.data;

                item.author = data.userName;
                item.description = renderToString(<FactpaperDescription content={data.content} checkinfo={data.checkInfoList} finalCheckInfo={data.finalCheckInfo} />);

                return item;
            })
        )
    );

    return {
        title: `澎湃明查 - ${status === 1 ? '有定论' : '核查中'}`,
        link: rootUrl,
        item: items,
    };
}

const FactpaperDescription = ({ content, checkinfo, finalCheckInfo }: { content: string; checkinfo?: Array<{ content: string }>; finalCheckInfo?: { content: string } }) => (
    <>
        <h1>发起求证</h1>
        {raw(content)}
        {checkinfo?.length ? (
            <>
                <h1>一起核查</h1>
                {checkinfo.map((check) => raw(check.content))}
            </>
        ) : null}
        {finalCheckInfo ? (
            <>
                <h1>有定论了</h1>
                {raw(finalCheckInfo.content)}
            </>
        ) : null}
    </>
);
