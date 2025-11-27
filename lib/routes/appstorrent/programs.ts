import path from 'node:path';

import { load } from 'cheerio';
import dayjs from 'dayjs';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import type { Options } from '@/utils/got';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/programs',
    categories: ['program-update'],
    example: '/appstorrent/programs',
    name: 'Programs',
    maintainers: ['xzzpig'],
    handler,
    url: 'appstorrent.ru/programs/',
};

async function handler(ctx?: Context): Promise<Data> {
    const limit = ctx?.req.query('limit') ? Number.parseInt(ctx?.req.query('limit') ?? '20') : 20;
    const baseUrl = 'https://appstorrent.ru';
    const currentUrl = `${baseUrl}/programs/`;
    const gotOptions: Options = {
        http2: true,
    };

    const response = await got(currentUrl, gotOptions);
    const $ = load(response.data as any);

    const selector = 'article.soft-item:not(.locked)';
    const list = $(selector)
        .slice(0, limit)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('.subtitle').text().trim(),
                link: $item.find('.subtitle a').attr('href')!,
                category: [$item.find('.info .category').text().trim()],
                version: $item.find('.version').text(),
                architecture: $item.find('.architecture').text().trim(),
                size: $item.find('.size').text().trim(),
            };
        });

    const items: DataItem[] = await Promise.all(
        list.map(
            (item) =>
                cache.tryGet(item.link, async () => {
                    const response = await got(item.link, gotOptions);
                    const $ = load(response.data as any);

                    const pubDate = parseDate($('.tech-info .date-news a').attr('href')?.replace('https://appstorrent.ru/', '') ?? '');

                    return {
                        title: item.title,
                        link: item.link,
                        category: item.category,
                        pubDate,
                        description: art(path.join(__dirname, 'templates/description.art'), {
                            cover: baseUrl + $('.main-title img').attr('src')?.trim(),
                            title: item.title,
                            pubDate: dayjs(pubDate).format('YYYY-MM-DD'),
                            version: item.version,
                            architecture: item.architecture,
                            compatibility: $('div.right > div.info > div.right-container > div:nth-child(5) > div > span:nth-child(2) > a').text(),
                            size: item.size,
                            activation: $('div.right > div.info > div.right-container > div:nth-child(4) > div > span:nth-child(2) > a').text(),
                            description: $('.content .body-content').first().text(),
                            changelog: $('.content .body-content').last().text(),
                            screenshots: $('.screenshots img')
                                .toArray()
                                .map((img) => $(img).attr('src'))
                                .map((src) => baseUrl + src),
                        }),
                    } as DataItem;
                }) as Promise<DataItem>
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl.toString(),
        allowEmpty: true,
        item: items,
    };
}
