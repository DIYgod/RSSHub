import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/beijing/jw/tzgg',
    categories: ['government'],
    example: '/gov/beijing/jw/tzgg',
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
            source: ['jw.beijing.gov.cn/tzgg'],
        },
    ],
    name: '通知公告',
    maintainers: ['nczitzk'],
    handler,
    url: 'jw.beijing.gov.cn/tzgg',
};

async function handler() {
    const rootUrl = 'http://jw.beijing.gov.cn';
    const currentUrl = `${rootUrl}/tzgg`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.col-md a')
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: link.startsWith('http') ? link : `${rootUrl}${link.replace(/^\./, '/tzgg')}`,
                pubDate: parseDate(item.parent().find('span').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const pubDate = content('meta[name="PubDate"]').attr('content');

                item.author = content('meta[name="ContentSource"]').attr('content');
                item.pubDate = pubDate ? timezone(parseDate(content('meta[name="PubDate"]').attr('content')), +8) : item.pubDate;
                item.description = content('.TRS_UEDITOR').html();

                return item;
            })
        )
    );

    return {
        title: '北京市教育委员会 - 通知公告',
        link: currentUrl,
        item: items,
        description: $('meta[name="ColumnDescription"]').attr('content'),
    };
}
