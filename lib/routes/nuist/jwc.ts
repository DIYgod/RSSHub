import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseTitle = '南京信息工程大学-教务处';
const baseUrl = 'https://jwc.nuist.edu.cn';

export const route: Route = {
    path: '/jwc/:category?',
    categories: ['forecast'],
    example: '/nuist/jwc/jxyw',
    parameters: { category: '默认为教学要闻' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处',
    maintainers: ['gylidian'],
    handler,
};

async function handler(ctx) {
    const { category = 'jxyw' } = ctx.req.param();
    const link = `${baseUrl}/${category === 'jxyw' || category === 'xyjx' ? 'index' : 'xxtz'}/${category}.htm`;

    const response = await got(link);
    const $ = load(response.data);
    const list = $('.main_list ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').contents().first().text(),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('.date').text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                item.description = $('#vsb_content').html();

                return item;
            })
        )
    );

    return {
        title: baseTitle + '：' + $('.dqwz').find('a').eq(1).text(),
        link,
        item: items,
    };
}
