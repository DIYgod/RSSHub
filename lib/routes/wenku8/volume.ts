import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { decode } from 'iconv-lite';

export default async (ctx) => {
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

    ctx.set('data', {
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
    });
};

const get = async (url: string) => decode(await got(url).buffer(), 'gbk');
