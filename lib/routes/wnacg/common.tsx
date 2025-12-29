import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const categories = {
    1: '同人誌 漢化',
    2: '同人誌 CG畫集',
    3: '同人誌 Cosplay',
    5: '同人誌',
    6: '單行本',
    7: '雜誌&短篇',
    9: '單行本 漢化',
    10: '雜誌&短篇 漢化',
    12: '同人誌 日語',
    13: '單行本 日語',
    14: '雜誌&短篇 日語',
    16: '同人誌 English',
    17: '單行本 English',
    18: '雜誌&短篇 English',
    19: '韓漫',
    20: '韓漫 漢化',
    21: '韓漫 生肉',
    22: '同人誌 3D漫畫',
};

const baseUrl = 'https://www.wnacg.com';

export async function handler(ctx) {
    const { cid, tag } = ctx.req.param();
    if (cid && !Object.keys(categories).includes(cid)) {
        throw new InvalidParameterError('此分类不存在');
    }

    const url = `${baseUrl}/albums${cid ? `-index-cate-${cid}` : ''}${tag ? `-index-tag-${tag}` : ''}.html`;
    const { data } = await got(url);
    const $ = load(data);

    const list = $('.gallary_item')
        .toArray()
        .map((item) => {
            item = $(item);
            const href = item.find('a').attr('href');
            const aid = href.match(/^\/photos-index-aid-(\d+)\.html$/)[1];
            return {
                title: item.find('a').attr('title'),
                link: `${baseUrl}${href}`,
                pubDate: parseDate(
                    item
                        .find('.info_col')
                        .text()
                        .replace(/\d+張照片，\n創建於/, ''),
                    'YYYY-MM-DD'
                ),
                aid,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: descRes } = await got(item.link, {
                    headers: {
                        referer: encodeURI(url),
                    },
                });
                let $ = load(descRes);
                const author = $('.uwuinfo p').first().text();
                const category = $('.tagshow')
                    .toArray()
                    .map((item) => $(item).text());
                $('.addtags').remove();
                const description = $('.uwconn').html();

                const { data } = await got(`${baseUrl}/photos-gallery-aid-${item.aid}.html`, {
                    headers: {
                        referer: `${baseUrl}/photos-slide-aid-${item.aid}.html`,
                    },
                });
                $ = load(data);

                const imgListMatch = $('script')
                    .text()
                    .match(/var imglist = (\[.*]);"\);/)[1];

                const imgList = JSON.parse(imgListMatch.replaceAll('url:', '"url":').replaceAll('caption:', '"caption":').replaceAll('fast_img_host+\\', '').replaceAll('\\', ''));

                item.author = author;
                item.category = category;
                item.description = renderToString(
                    <>
                        {description ? raw(description) : null}
                        <br />
                        {imgList ? imgList.map((img) => <img src={`https:${img.url}`} alt={img.caption} />) : null}
                    </>
                );

                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link: url,
        item: items,
    };
}
