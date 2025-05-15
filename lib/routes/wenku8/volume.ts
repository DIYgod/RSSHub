import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { decode } from 'iconv-lite';

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
    const aid = Number.parseInt(ctx.req.param('id'));
    const link = `https://www.wenku8.net/novel/${Math.floor(aid / 1000)}/${aid}/index.htm`;
    const $ = load(await get(link));
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
        item: await cache.tryGet(volumeUrl, async () =>
            [...(await get(volumeUrl)).matchAll(/\s{2}(\S.*)\r?\n([\S\s]+?)\r?\n\r?\n/g)]
                .map((chapter, index) => ({
                    title: chapter[1],
                    description: chapter[2]
                        .split('\r\n')
                        .filter((line) => line.trim())
                        .map((line) => `<p>${line.trim()}</p>`)
                        .join(''),
                    guid: Buffer.from(`${vid}${chapter[1]}`).toString('base64'),
                    link: lastestChapters[index]?.link,
                }))
                .filter((chapter) => chapter.description)
                .toReversed()
        ),
    };
}

const get = async (url: string) => decode(await got(url).buffer(), 'gbk');
