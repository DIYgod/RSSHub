import { load } from 'cheerio';
import dayjs from 'dayjs';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import type { Options } from '@/utils/got';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
                        description: renderToString(
                            <>
                                <p>
                                    <img src={baseUrl + $('.main-title img').attr('src')?.trim()} />
                                    <h1>{item.title}</h1>
                                    <br />
                                    <b>Public Date</b>: {dayjs(pubDate).format('YYYY-MM-DD')}
                                    <br />
                                    <b>Version</b>: {item.version}
                                    <br />
                                    <b>Architecture</b>: {item.architecture}
                                    <br />
                                    <b>Compactibility</b>: {$('div.right > div.info > div.right-container > div:nth-child(5) > div > span:nth-child(2) > a').text()}
                                    <br />
                                    <b>Size</b>: {item.size}
                                    <br />
                                    <b>Activation</b>: {$('div.right > div.info > div.right-container > div:nth-child(4) > div > span:nth-child(2) > a').text()}
                                    <br />
                                </p>
                                <b>Description</b>:<p>{$('.content .body-content').first().text()}</p>
                                <b>Change Log</b>:<p>{$('.content .body-content').last().text()}</p>
                                <b>Screenshots</b>
                                {$('.screenshots img')
                                    .toArray()
                                    .map((img) => $(img).attr('src'))
                                    .map((src) => baseUrl + src)
                                    .map((src) => (
                                        <img src={src} />
                                    ))}
                            </>
                        ),
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
