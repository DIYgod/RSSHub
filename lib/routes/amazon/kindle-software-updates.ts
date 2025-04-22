import { Route } from '@/types';

import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';
import { load } from 'cheerio';
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
        .map(function () {
            const data = {};
            data.title = $(this).find('.sectiontitle').text();
            data.link = $(this).find('a').eq(0).attr('href');
            data.version = $(this).find('li').first().text();
            data.website = `${url}?nodeId=${nodeIdValue}`;
            data.description = $(this)
                .find('.a-column.a-span8')
                .html()
                .replaceAll(/[\t\n]/g, '');
            return data;
        })
        .get();
    return {
        title: 'Kindle E-Reader Software Updates',
        link: `${url}?nodeId=${nodeIdValue}`,
        description: 'Kindle E-Reader Software Updates',
        item: list.map((item) => ({
            title: item.title + ' - ' + item.version,
            description:
                item.description +
                art(path.join(__dirname, 'templates/software-description.art'), {
                    item,
                }),
            guid: item.title + ' - ' + item.version,
            link: item.link,
        })),
    };
}
