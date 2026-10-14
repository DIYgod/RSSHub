import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const categories = {
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
    37: 'AI圖集',
    38: '合集',
};
const baseUrl = 'https://www.wnacg.com';
const parseImageList = (
    script: string
): Array<{
    url: string;
    caption: string;
}> => {
    const encoded = script.match(/document\.writeln\(("(?:\\.|[^"\\])*var imglist\s*=(?:\\.|[^"\\])*")\);/)?.[1];
    if (!encoded) {
        throw new Error('The gallery image list is missing. Check whether the gallery is accessible on WNACG.');
    }
    const decoded = JSON.parse(escapeJsonControls(encoded));
    const list = decoded.match(/var imglist\s*=\s*(\[[\s\S]*\]);/)?.[1];
    if (!list) {
        throw new Error('The gallery image list has an unsupported format.');
    }
    return JSON.parse(
        list.replaceAll(/"(?:\\.|[^"\\])*"|\bfast_img_host\s*\+\s*|\b(?:url|caption)\s*:/g, (token) => {
            if (token.startsWith('"')) {
                return token;
            }
            return token.startsWith('fast_img_host') ? '' : `${JSON.stringify(token.slice(0, -1).trim())}:`;
        })
    );
};
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
        .map(
            (
                item
            ): DataItem & {
                link: string;
                aid: string;
            } => {
                const $item = $(item);
                const href = $item.find('a').attr('href');
                const aid = href!.match(/^\/photos-index-aid-(\d+)\.html$/)![1];
                const date = $item
                    .find('.info_col')
                    .text()
                    .match(/\d{4}-\d{2}-\d{2}/)?.[0];
                return {
                    title: $item.find('a').attr('title')!,
                    link: `${baseUrl}${href}`,
                    pubDate: date ? parseDate(date, 'YYYY-MM-DD') : undefined,
                    aid,
                };
            }
        );
    const items = await unwrapFirstFailure(
        pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(`wnacg:detail:v4:${item.link}`, async () => {
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
                    const imgList = parseImageList($('script').text());
                    const descriptionHtml = renderToString(
                        <>
                            {description ? raw(description) : null}
                            <br />
                            {imgList ? imgList.map((img) => <img src={new URL(img.url, baseUrl).href} alt={img.caption} />) : null}
                        </>
                    );
                    return { author, category, description: descriptionHtml };
                });
                return { ...item, author: detail.author, category: detail.category, description: detail.description };
            },
            { concurrency: 3, stopOnError: false }
        )
    );
    return {
        title: $('head title').text(),
        link: url,
        item: items,
    };
}
async function unwrapFirstFailure<T>(promise: Promise<T>): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        throw error instanceof AggregateError ? error.errors[0] : error;
    }
}

function escapeJsonControls(value: string): string {
    return Array.from(value, (character) => {
        const code = character.charCodeAt(0);
        return code <= 31 ? `\\u${code.toString(16).padStart(4, '0')}` : character;
    }).join('');
}
