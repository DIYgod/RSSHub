import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function copyElements<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, element) => cloneNode(element, true));
    const root = new Document(copy.toArray());
    copy.each((_, element) => {
        element.parent = root;
    });
    return copy;
}

const rootUrl = 'https://rsj.sh.gov.cn';

const renderDescription = (fields: Array<{ name: string; value: string }>) =>
    renderToString(
        <>
            {fields.map(({ name, value }) => (
                <p key={name}>
                    {name}：{value}
                </p>
            ))}
        </>
    );

export const route: Route = {
    path: '/rsj/ksxm',
    categories: ['government'],
    example: '/gov/sh/rsj/ksxm',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['rsj.sh.gov.cn/'],
            target: '/rsj/ksxm',
        },
        {
            source: ['rsj.sh.gov.cn/tksxm_17825/index.html'],
            target: '/rsj/ksxm',
        },
    ],
    name: '职业能力考试院 考试项目',
    maintainers: ['Fatpandac'],
    handler,
    url: 'rsj.sh.gov.cn/',
};

async function handler() {
    const url = `${rootUrl}/tksxm_17825/index.html`;
    const { data } = await got(url);
    const $ = load(data);
    const headers = $('.table-exam thead th')
        .toArray()
        .map((cell) => $(cell).text());
    const items = $('.table-exam tbody tr')
        .toArray()
        .map((row) => {
            const cells = $(row).children('td');
            const title = cells.eq(1).find('a');
            const published = copyElements(cells.eq(3)).children().remove().end().text().trim();
            const pubDate = published ? timezone(parseDate(published, 'YYYY-MM-DD', true), 8) : undefined;
            return {
                title: title.attr('title') || title.text(),
                link: new URL(title.attr('href')!, url).href,
                description: renderDescription(
                    cells
                        .toArray()
                        .map((cell, index) => ({ name: headers[index], value: $(cell).text().replaceAll(/\s+/g, ' ').trim(), index }))
                        .filter(({ index, value }) => index >= 2 && index !== 3 && value)
                ),
                category: [cells.eq(0).text()],
                pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
            };
        });

    return {
        title: '上海市职业能力考试院 - 考试项目',
        link: url,
        item: items,
    };
}
