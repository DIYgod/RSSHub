import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';

const host = 'https://www.amazon.com';
export const route: Route = {
    path: '/kindle/software-updates',
    categories: ['program-update'],
    example: '/amazon/kindle/software-updates',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Kindle Software Updates',
    maintainers: ['EthanWng97'],
    handler,
};

async function handler() {
    const url = host + '/gp/help/customer/display.html';
    const nodeIdValue = 'GKMQC26VQQMM8XSW';
    const response = await got({
        method: 'get',
        url,
        searchParams: {
            nodeId: nodeIdValue,
        },
    });
    const data = response.data;

    const $ = load(data);
    const list = $('.a-row.cs-help-landing-section.help-display-cond')
        .toArray()
        .map((item) => {
            const data = {
                title: $(item).find('.sectiontitle').text(),
                link: $(item).find('a').eq(0).attr('href'),
                version: $(item).find('li').first().text(),
                website: `${url}?nodeId=${nodeIdValue}`,
                description: $(item)
                    .find('.a-column.a-span8')
                    .html()
                    .replaceAll(/[\t\n]/g, ''),
            };
            return data;
        });
    return {
        title: 'Kindle E-Reader Software Updates',
        link: `${url}?nodeId=${nodeIdValue}`,
        description: 'Kindle E-Reader Software Updates',
        item: list.map((item) => ({
            title: item.title + ' - ' + item.version,
            description:
                item.description +
                renderToString(
                    <div>
                        <br />
                        <br />
                        <a href={item.website}>Kindle Website</a>
                    </div>
                ),
            guid: item.title + ' - ' + item.version,
            link: item.link,
        })),
    };
}
