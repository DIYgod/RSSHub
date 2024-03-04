// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
const CryptoJS = require('crypto-js');
import { art } from '@/utils/render';
import * as path from 'node:path';

const getRequestToken = () => {
    const e = 'sgn51n6r6q97o6g3';
    const t = 'jzhotdata';
    return CryptoJS.DES.encrypt(`${Date.now().toString()}-${e}`, t).toString();
};

const baseUrl = 'https://vp.fact.qq.com';

export default async (ctx) => {
    const { data: response } = await got(`${baseUrl}/api/article/list`, {
        headers: {
            Referer: `${baseUrl}/home`,
        },
        searchParams: {
            page: 1,
            locale: 'zh-CN',
            token: getRequestToken(),
        },
    });

    const list = response.data.list.map((item) => ({
        title: `【${item.explain}】${item.title}`,
        description: `<img src="${item.cover}"><br>${item.abstract}`,
        pubDate: parseDate(item.date, 'YYYY-MM-DD'),
        author: `${item.Author.name} - ${item.Author.desc}`,
        category: item.tag,
        link: `${baseUrl}/article?id=${item.id}`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                const nextData = JSON.parse($('#__NEXT_DATA__').text());
                const { initialState } = nextData.props.pageProps;

                item.description = art(path.join(__dirname, '../templates/article.art'), {
                    data: initialState,
                });
                item.pubDate = parseDate(initialState.createdAt);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '较真查证平台 - 腾讯新闻',
        link: `${baseUrl}/home`,
        item: items,
    });
};
