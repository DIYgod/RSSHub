import { load } from 'cheerio';
import { escapeText } from 'entities';
import { decode } from 'iconv-lite';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/volume/:id',
    categories: ['reading'],
    example: '/wenku8/volume/1163',
    parameters: { id: '小说 id, 可在对应小说页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '最新卷',
    maintainers: ['huangliangshusheng'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
        throw new InvalidParameterError('id must be a positive integer novel ID.');
    }
    const aid = Number(id);
    const link = `https://www.wenku8.net/novel/${Math.floor(aid / 1000)}/${aid}/index.htm`;
    const html = await get(link);
    const $ = load(html);
    const vid = $('.vcss').last().parent().next().find('a')[0].attribs.href.replace('.htm', '');
    const volumeUrl = `https://dl.wenku8.com/packtxt.php?aid=${aid}&vid=${vid}&charset=gbk`;
    const lastestChapters = $('.vcss')
        .last()
        .parent()
        .nextAll()
        .find('a')
        .toArray()
        .map((a) => ({ link: a.attribs.href }));

    return {
        title: `轻小说文库 ${$('#title').text()} 最新卷`,
        link,
        item: await cache.tryGet(`wenku8:volume:v1:${volumeUrl}`, async () =>
            (await get(volumeUrl))
                .matchAll(/\s{2}(\S.*)\r?\n([\s\S]+?)\r?\n\r?\n/g)
                .toArray()
                .map((chapter, index) => ({
                    title: chapter[1],
                    description: chapter[2]
                        .split(/\r?\n/)
                        .filter((line) => line.trim())
                        .map((line) => `<p>${escapeText(line.trim())}</p>`)
                        .join(''),
                    guid: Buffer.from(`${vid}${chapter[1]}`).toString('base64'),
                    link: lastestChapters[index]?.link,
                }))
                .filter((chapter) => chapter.description)
                .toReversed()
        ),
    };
}

const get = async (url: string) => {
    const { data } = await got(url, { responseType: 'buffer' });
    return decode(data, 'gbk');
};
