// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';
const baseUrl = 'https://www3.nhk.or.jp';
const apiUrl = 'https://nwapi.nhk.jp';

export default async (ctx) => {
    const { lang = 'en' } = ctx.req.param();
    const { data } = await got(`${apiUrl}/nhkworld/rdnewsweb/v7b/${lang}/outline/list.json`);
    const meta = await got(`${baseUrl}/nhkworld/common/assets/news/config/${lang}.json`);

    let items = data.data.map((item) => ({
        title: item.title,
        description: item.description,
        link: `${baseUrl}${item.page_url}`,
        pubDate: parseDate(item.updated_at, 'x'),
        id: item.id,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(`${apiUrl}/nhkworld/rdnewsweb/v6b/${lang}/detail/${item.id}.json`);
                item.category = Object.values(data.data.categories);
                item.description = art(path.join(__dirname, 'templates/news.art'), {
                    img: data.data.thumbnails,
                    description: data.data.detail.replace('\n\n', '<br><br>'),
                });
                delete item.id;
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${Object.values(meta.data.config.navigation.header).find((h) => h.keyname === 'topstories')?.name} | NHK WORLD-JAPAN News`,
        link: `${baseUrl}/nhkworld/${lang}/news/list/`,
        item: items,
    });
};
