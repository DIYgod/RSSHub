import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
const domain = 'manhua.fffdm.com';
const host = `https://${domain}`;
import { art } from '@/utils/render';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';

const get_pic = async (url) => {
    const response = await got(url);
    const data = response.data;
    return {
        comicTitle: data.mhinfo.title,
        chapterTitle: data.title,
        pics: data.cont,
        pubDate: parseDate(data.mh.time),
    };
};

export const route: Route = {
    path: '/manhua/:id/:cdn?',
    categories: ['anime'],
    example: '/fffdm/manhua/93',
    parameters: { id: '漫画ID。默认获取全部，建议使用通用参数limit获取指定数量', cdn: 'cdn加速器。默认5，当前可选1-5' },
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
            source: ['www.fffdm.com/manhua/:id', 'www.fffdm.com/:id'],
            target: '/manhua/:id',
        },
    ],
    name: '在线漫画',
    maintainers: ['zytomorrow'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const count = ctx.req.query('limit') || 99999;
    const cdnNum = ctx.req.param('cdn') || 5;
    const cdn = !Number.isNaN(Number.parseInt(cdnNum)) && 1 <= Number.parseInt(cdnNum) && Number.parseInt(cdnNum) <= 5 ? `https://p${cdnNum}.fzacg.com` : `https://p5.fzacg.com`;

    // 获取漫画清单
    const response = await got(`${host}/api/manhua/${id}`);
    const data = response.data;

    const chapter_detail = await Promise.all(
        data.mhlist.splice(0, count).map((item) => {
            const url = `${host}/api/manhua/${id}/${item.url}`;
            return cache.tryGet(url, async () => {
                const picContent = await get_pic(url);
                return {
                    title: picContent.chapterTitle,
                    description: art(path.join(__dirname, '../templates/manhua.art'), { pic: picContent.pics, cdn }),
                    link: `${host}/${id}/${item.url}/`,
                    comicTitle: picContent.comicTitle,
                    pubDate: picContent.pubDate,
                };
            });
        })
    );
    return {
        title: '风之动漫 - ' + chapter_detail[0].comicTitle,
        link: `${host}/${id}`,
        description: '风之动漫',
        item: chapter_detail,
    };
}
