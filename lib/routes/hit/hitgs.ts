import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/hitgs',
    categories: ['university'],
    example: '/hit/hitgs',
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
            source: ['hitgs.hit.edu.cn/*'],
        },
    ],
    name: '研究生院通知公告',
    maintainers: ['hlmu'],
    handler,
    url: 'hitgs.hit.edu.cn/*',
};

async function handler() {
    const host = 'https://hitgs.hit.edu.cn';

    const response = await got(host + '/tzgg/list.htm', {
        headers: {
            Referer: host,
        },
    });

    const $ = load(response.data);
    const list = $('.news_list li')
        .toArray()
        .map((e) => ({
            pubDate: parseDate($('span:nth-child(4)', e).text()),
            title: $('span.Article_BelongCreateOrg.newsfb', e).text() + $('span a', e).attr('title'),
            category: $('span.Article_BelongCreateOrg.newsfb', e).text().slice(1, -1),
            link: host + $('span a', e).attr('href'),
        }));

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link, {
                    headers: {
                        Referer: host,
                    },
                });
                const $ = load(response.data);
                item.description = $('.wp_articlecontent').html();
                item.author = $('div.infobox > div > p > span:nth-child(3)').text().slice(3);
                return item;
            })
        )
    );

    return {
        title: '哈工大研究生院通知公告',
        link: host + '/tzgg/list.htm',
        description: '哈尔滨工业大学研究生院通知公告',
        item: out,
    };
}
