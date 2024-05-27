import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';
export const route: Route = {
    path: '/tv/user/wish/:id',
    categories: ['anime'],
    example: '/bangumi/tv/user/wish/sai',
    parameters: { id: '用户 id, 在用户页面地址栏查看' },
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
            source: ['bgm.tv/anime/list/:id/wish'],
        },
    ],
    name: '用户想看',
    maintainers: ['honue'],
    handler,
};

async function handler(ctx) {
    const userid = ctx.req.param('id');
    const url = `https://bgm.tv/anime/list/${userid}/wish`;
    const response = await got({
        url,
        method: 'get',
        headers: {
            'User-Agent': config.trueUA,
        },
    });
    const $ = load(response.body);

    const username = $('.name').find('a').html();
    const items = $('#browserItemList')
        .find('li')
        .toArray()
        .map((item) => {
            const aTag = $(item).find('h3').children('a');
            const jdate = $(item).find('.collectInfo').find('span').html();
            return {
                title: aTag.html(),
                link: 'https://bgm.tv' + aTag.attr('href'),
                pubDate: timezone(parseDate(jdate), 0),
            };
        });

    return {
        title: `${username}想看的动画`,
        link: url,
        item: items,
        description: `${username}想看的动画列表`,
    };
}
