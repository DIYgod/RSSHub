import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/onair/:lang?',
    categories: ['anime'],
    example: '/bgmlist/onair/zh-Hans',
    parameters: { lang: '语言' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '开播提醒',
    maintainers: ['x2cf'],
    handler,
};

async function handler(ctx) {
    const lang = ctx.req.param('lang');
    const { data: sites } = await got('https://bgmlist.com/api/v1/bangumi/site');
    const { data } = await got('https://bgmlist.com/api/v1/bangumi/onair');

    return {
        title: '番组放送 开播提醒',
        link: 'https://bgmlist.com/',
        item: data.items.map((item) => {
            item.sites.push({ site: 'dmhy', id: item.titleTranslate['zh-Hans']?.[0] ?? item.title });
            return {
                title: item.titleTranslate[lang]?.[0] ?? item.title,
                link: item.officialSite,
                description: art(
                    path.join(__dirname, 'templates/description.art'),
                    item.sites.map((site) => ({
                        title: sites[site.site].title,
                        url: sites[site.site].urlTemplate.replaceAll('{{id}}', site.id),
                        begin: site.begin,
                    }))
                ),
                pubDate: parseDate(item.begin),
                guid: item.id,
            };
        }),
    };
}
