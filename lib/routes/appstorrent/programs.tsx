import { load } from 'cheerio';
import type { Context } from 'hono';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

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
    const limit = ctx ? getRouteLimit(ctx, 20) : 20;
    const baseUrl = 'https://appstorrent.ru';
    const currentUrl = `${baseUrl}/programs/`;
    const gotOptions: Parameters<typeof got>[1] = {
        http2: true,
    };

    const response = await got(currentUrl, gotOptions);
    const $ = load(response.data);
    const feedResponse = await got(`${currentUrl}rss.xml`, gotOptions);
    const feed = load(feedResponse.data, { xmlMode: true });
    const publicationDates = new Map(
        feed('item')
            .toArray()
            .map((item) => [feed(item).find('link').text(), feed(item).find('pubDate').text()])
    );

    const selector = 'article.soft-item:not(.locked)';
    const list = $(selector)
        .slice(0, limit)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('.subtitle').text().trim(),
                link: new URL($item.find('.subtitle a').attr('href')!, baseUrl).href,
                category: [$item.find('.info .category').text().trim()],
                version: $item.find('.version').text(),
                architecture: $item.find('.architecture').text().trim(),
                size: $item.find('.size').text().trim(),
            };
        });

    const items: DataItem[] = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async (): Promise<DataItem> => {
                const response = await got(item.link, gotOptions);
                const $ = load(response.data);
                $('script').remove();
                const icon = $('.cover-hero__icon img').attr('src');

                const pubDate = publicationDates.get(item.link);

                return {
                    title: item.title,
                    link: item.link,
                    category: item.category,
                    pubDate: pubDate ? parseDate(pubDate) : undefined,
                    description: renderToString(
                        <>
                            <p>
                                {icon ? <img src={new URL(icon, baseUrl).href} /> : null}
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
                            <b>Description</b>:<div>{raw($('.cover-hero-body__desc').html() ?? '')}</div>
                            <b>Change Log</b>:<div>{raw($('.media-card--text .body-content').first().html() ?? '')}</div>
                            <b>Screenshots</b>
                            {$('.screenshots img')
                                .toArray()
                                .map((img) => $(img).attr('src'))
                                .filter((src): src is string => Boolean(src))
                                .map((src) => new URL(src, baseUrl).href)
                                .map((src) => (
                                    <img src={src} />
                                ))}
                        </>
                    ),
                };
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        allowEmpty: true,
        item: items,
    };
}
