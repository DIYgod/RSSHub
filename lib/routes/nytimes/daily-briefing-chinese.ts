import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/daily_briefing_chinese',
    categories: ['traditional-media'],
    example: '/nytimes/daily_briefing_chinese',
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
            source: ['nytimes.com/'],
            target: '',
        },
    ],
    name: 'Daily Briefing',
    maintainers: ['yueyericardo', 'nczitzk'],
    handler,
    url: 'nytimes.com/',
    description: `URL: [https://www.nytimes.com/zh-hans/series/daily-briefing-chinese](https://www.nytimes.com/zh-hans/series/daily-briefing-chinese)`,
};

async function handler() {
    const rootUrl = 'https://www.nytimes.com';
    const currentUrl = `${rootUrl}/zh-hans/series/daily-briefing-chinese`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const listData = JSON.parse(response.data.match(/"initialState":(.*),"config"/)[1]);

    let items = [];
    for (const key of Object.keys(listData)) {
        if (key.startsWith('Article:') && listData[key].url) {
            const item = listData[key];
            items.push({
                link: item.url,
                pubDate: parseDate(item.firstPublished),
            });
        }
    }

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                // to remove ads
                content('.StoryBodyCompanionColumn').last().find('p').last().remove();

                const images = detailResponse.data.match(/"url":"[^{}]+","name":"articleLarge"/g).map((e) => JSON.parse(`{${e}}`).url);

                let i = 0;
                content('figure').each(function () {
                    content(this).html(
                        art(path.join(__dirname, 'templates/image.art'), {
                            url: images[i++],
                        })
                    );
                });

                item.title = content('meta[property="og:title"]').attr('content');
                item.author = content('meta[name="byl"]').attr('content').replace(/By /, '');
                item.description = content('section[name="articleBody"]').html();

                return item;
            })
        )
    );

    return {
        title: 'Daily Briefing - The New York Times',
        link: currentUrl,
        item: items,
    };
}
