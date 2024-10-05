import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/tab/:tabid',
    categories: ['bbs', 'popular'],
    view: ViewType.Articles,
    example: '/v2ex/tab/hot',
    parameters: { tabid: 'tab标签ID,在 URL 可以找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '标签',
    maintainers: ['liyefox'],
    handler,
};

async function handler(ctx) {
    const tabid = ctx.req.param('tabid');
    const host = 'https://v2ex.com';
    const pageUrl = `${host}/?tab=${tabid}`;

    const response = await got({
        method: 'get',
        url: pageUrl,
    });

    const $ = load(response.data);
    const links = $('span.item_title > a')
        .toArray()
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10)
        .map((link) => `${host}${$(link).attr('href').replace(/#.*$/, '')}`);

    const items = await Promise.all(
        links.map((link) =>
            cache.tryGet(`v2ex-${link}`, async () => {
                const response = await got({
                    method: 'get',
                    url: link,
                });

                const $ = load(response.data);
                const list = $('[id^="r_"]').toArray();
                const replyContent = list
                    .map((item) => {
                        const post = $(item);
                        const content = post.find('.reply_content').html();
                        const author = post.find('.dark').first().text();
                        const no = post.find('.no').text();
                        return `<p><div>#${no}: <i>${author}</i></div><div>${content}</div></p>`;
                    })
                    .join('');

                return {
                    title: $('.header h1').text(),
                    link,
                    description: `${$('div.topic_content').html()}<div>${replyContent}</div>`,
                    author: $('div.header > small > a').text(),
                };
            })
        )
    );

    return {
        title: `V2EX-${tabid}`,
        link: pageUrl,
        description: `V2EX-tab-${tabid}`,
        item: items,
    };
}
