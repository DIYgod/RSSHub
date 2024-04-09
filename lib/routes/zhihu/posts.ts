import { Route } from '@/types';
import got from '@/utils/got';
import utils from './utils';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/posts/:usertype/:id',
    categories: ['social-media'],
    example: '/zhihu/posts/people/frederchen',
    parameters: { usertype: '作者 id，可在用户主页 URL 中找到', id: '用户类型usertype，参考用户主页的URL。目前有两种，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.zhihu.com/:usertype/:id/posts'],
        },
    ],
    name: '用户文章',
    maintainers: ['whtsky', 'Colin-XKL'],
    handler,
    description: `| 普通用户 | 机构用户 |
| -------- | -------- |
| people   | org      |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const usertype = ctx.req.param('usertype');

    const { data } = await got(`https://www.zhihu.com/${usertype}/${id}/posts`, {
        headers: {
            ...utils.header,
            Referer: `https://www.zhihu.com/${usertype}/${id}/`,
        },
    });
    const $ = load(data);
    const jsondata = $('#js-initialData');
    const authorname = $('.ProfileHeader-name')
        .contents()
        .filter((_index, element) => element.type === 'text')
        .text();
    const authordescription = $('.ProfileHeader-headline').text();

    const parsed = JSON.parse(jsondata.html());
    const articlesdata = parsed.initialState.entities.articles;

    const list = Object.keys(articlesdata).map((key) => {
        const $ = load(articlesdata[key].content, null, false);
        $('noscript').remove();
        $('img').each((_, item) => {
            if (item.attribs['data-actualsrc'] || item.attribs['data-original']) {
                item.attribs['data-actualsrc'] = item.attribs['data-actualsrc'] ? item.attribs['data-actualsrc'].split('?source')[0] : null;
                item.attribs['data-original'] = item.attribs['data-original'] ? item.attribs['data-original'].split('?source')[0] : null;
                item.attribs.src = item.attribs['data-original'] || item.attribs['data-actualsrc'];
                delete item.attribs['data-actualsrc'];
                delete item.attribs['data-original'];
            }
        });
        return {
            title: articlesdata[key].title,
            description: $.html(),
            link: articlesdata[key].url,
            pubDate: parseDate(articlesdata[key].created, 'X'),
        };
    });

    return {
        title: `${authorname} 的知乎文章`,
        link: `https://www.zhihu.com/${usertype}/${id}/posts`,
        description: authordescription,
        item: list,
    };
}
