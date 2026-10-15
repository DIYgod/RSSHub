import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const domain = 'manhua.fffdm.com';
const host = `https://${domain}`;

const getPictures = async (url) => {
    const response = await got(url);
    const data = response.data;
    return {
        chapterTitle: data.title,
        pics: data.cont,
    };
};

export const route: Route = {
    path: '/manhua/:id/:cdn?',
    categories: ['anime'],
    example: '/fffdm/manhua/93',
    parameters: { id: '漫画ID。默认获取全部，建议使用通用参数limit获取指定数量', cdn: '图片服务器。默认使用官网主线路img.fzacg.com，可选1-5指定旧CDN线路' },
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
            // Radar clients merge source arrays by index; overwrite both legacy slots.
            source: ['www.fffdm.com/manhua/:id', 'www.fffdm.com/manhua/:id'],
            target: '/manhua/:id',
        },
        {
            source: ['manhua.fffdm.com/:id/:chapter'],
            target: '/manhua/:id',
        },
    ],
    name: '在线漫画',
    maintainers: ['zytomorrow'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const cdnNum = ctx.req.param('cdn');
    const cdn = cdnNum && /^[1-5]$/.test(cdnNum) ? `https://p${cdnNum}.fzacg.com` : 'https://img.fzacg.com';

    // Fetch the current chapter list.
    const response = await got(`${host}/api/manhua/${id}`);
    const data = response.data;

    const chapters: Array<{ url: string; time?: string; pubDate?: Date }> = data.mhlist.map((item) => ({ ...item, pubDate: item.time ? parseDate(item.time) : undefined }));
    const limit = getRouteLimit(ctx);
    const sorted = ctx.req.query('sorted') !== 'false';
    const candidates =
        limit === undefined || (sorted && chapters.some((item) => !item.pubDate || !Number.isFinite(item.pubDate.getTime())))
            ? chapters
            : (sorted ? chapters.toSorted((a, b) => b.pubDate!.getTime() - a.pubDate!.getTime()) : chapters).slice(0, limit);
    const chapterDetails = await pMap(
        candidates,
        async (item) => {
            const url = `${host}/api/manhua/${id}/${item.url}`;
            const picContent = await cache.tryGet(`${url}#pictures`, () => getPictures(url));
            return {
                title: picContent.chapterTitle,
                description: renderToString(
                    <div>
                        {picContent.pics.map((value) => (
                            <>
                                <img src={`${cdn}/${value}`} />
                                <br />
                            </>
                        ))}
                    </div>
                ),
                link: `${host}/${id}/${item.url}/`,
                pubDate: item.pubDate,
            };
        },
        { concurrency: 3 }
    );
    return {
        title: '风之动漫 - ' + data.mhinfo.title,
        link: `${host}/${id}`,
        language: 'zh-CN' as const,
        description: '风之动漫',
        item: chapterDetails,
    };
}
