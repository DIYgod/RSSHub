import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/replies/:uid',
    categories: ['social-media'],
    example: '/douban/replies/xiaoyaxiaoya',
    parameters: { uid: '用户id，可在用户日记页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '日记最新回应',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const currentUrl = `https://www.douban.com/people/${ctx.req.param('uid')}/notes`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);
    const list = $('div.recent-replies-mod ul.comment-list li')
        .map((_, item) => {
            item = $(item);
            const p = item.find('p');
            const match = p
                .find('a')
                .attr('href')
                .match(/%2Fnote%2F(.*?)%2F%23(.*?)&type=note/);
            const nid = match[1];
            const cid = match[2];
            p.remove();
            return {
                link: `https://www.douban.com/note/${nid}/#${cid}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const comments = JSON.parse(detailResponse.data.match(/'comments':(.*)}],/)[1] + '}]');

                for (const c of comments) {
                    if (c.id === item.link.split('#')[1]) {
                        return {
                            link: item.link,
                            title: `${c.author.name} 于 ${c.create_time} 的回应`,
                            pubDate: new Date(c.create_time + ' GMT+8').toUTCString(),
                            description: c.text,
                            author: c.author.name,
                        };
                    } else if (c.replies.length > 0) {
                        comments.push(...c.replies);
                    }
                }
            })
        )
    );

    return {
        title: $('title').text() + ' - 最新回应',
        link: currentUrl,
        item: items,
    };
}
