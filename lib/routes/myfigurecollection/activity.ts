import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { isValidHost } from '@/utils/valid-host';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/activity/:category?/:language?/:latestAdditions?/:latestEdits?/:latestAlerts?/:latestPictures?',
    categories: ['shopping'],
    example: '/myfigurecollection/activity',
    parameters: {
        category: 'Category, Figures by default',
        language: 'Language, as above, `en` by default',
        latestAdditions: 'Latest Additions, on as `1` by default, off as `0`',
        latestEdits: 'Changes, on as `1` by default, off as `0`',
        latestAlerts: 'Alerts, on as `1` by default, off as `0`',
        latestPictures: 'Pictures, on as `1` by default, off as `0`',
    },
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
            source: ['zh.myfigurecollection.net/browse', 'zh.myfigurecollection.net/'],
            target: '/:category?/:language?',
        },
    ],
    name: 'Activity',
    maintainers: ['nczitzk'],
    handler,
    url: 'zh.myfigurecollection.net/browse',
    description: `Category

| Figures | Goods | Media |
| ------- | ----- | ----- |
| 0       | 1     | 2     |

  Language

| Id | Language   |
| -- | ---------- |
|    | en         |
| de | Deutsch    |
| es | Español    |
| fi | Suomeksi   |
| fr | Français   |
| it | Italiano   |
| ja | 日本語     |
| nl | Nederlands |
| no | Norsk      |
| pl | Polski     |
| pt | Português  |
| ru | Русский    |
| sv | Svenska    |
| zh | 中文       |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '-1';
    const language = ctx.req.param('language') ?? '';
    const latestAdditions = ctx.req.param('latestAdditions') ?? '1';
    const latestEdits = ctx.req.param('latestEdits') ?? '1';
    const latestAlerts = ctx.req.param('latestAlerts') ?? '1';
    const latestPictures = ctx.req.param('latestPictures') ?? '1';

    if (language && !isValidHost(language)) {
        throw new InvalidParameterError('Invalid language');
    }

    const rootUrl = `https://${language === 'en' || language === '' ? '' : `${language}.`}myfigurecollection.net`;
    const currentUrl = `${rootUrl}/browse.v4.php?mode=activity&latestAdditions=${latestAdditions}&latestEdits=${latestEdits}&latestAlerts=${latestAlerts}&latestPictures=${latestPictures}&rootId=${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.activity-wrapper')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: `${item.find('.activity-label').text().split(' • ')[0]}: ${item.find('.stamp-anchor').text()}`,
                link: `${rootUrl}${item.find('.stamp-anchor .tbx-tooltip').attr('href')}`,
                pubDate: timezone(parseDate(item.find('.activity-time span').attr('title')), +0),
                author: item.find('.user-anchor').text(),
                description: art(path.join(__dirname, 'templates/activity.art'), {
                    changelog: item.find('.changelog').text(),
                    pictures: item
                        .find('.picture-icon')
                        .toArray()
                        .map((image) =>
                            $(image)
                                .html()
                                .match(/url\((.*)\)/)[1]
                                .replace(/\/thumbnails/, '')
                        ),
                }),
            };
        });

    return {
        title: $('title')
            .text()
            .replace(/ \(.*\)/, ''),
        link: currentUrl,
        item: items,
    };
}
