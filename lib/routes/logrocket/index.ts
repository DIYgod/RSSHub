import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库
import { load } from 'cheerio'; // 类似 jQuery 的 API HTML 解析器
import { Route } from '@/types';
import cache from '@/utils/cache';
import { art } from '@/utils/render';
import { getCurrentPath } from '@/utils/helpers';
import path from 'node:path';
const __dirname = getCurrentPath(import.meta.url);
export const route: Route = {
    path: '/:type',
    categories: ['blog'],
    example: '/dev',
    parameters: { type: 'dev | product-management | ux-design' },
    radar: [
        {
            source: ['blog.logrocket.com'],
        },
    ],
    name: 'blog.logrocket',
    maintainers: ['findwei'],
    handler,
    url: 'blog.logrocket.com/',
};
async function handler(ctx) {
    const type = ctx.req.param('type');
    const link = 'https://blog.logrocket.com/';
    let title = '开发';
    if (type === 'product-management') {
        title = '产品管理';
    } else if (type === 'ux-design') {
        title = '用户体验设计';
    }
    const response = await ofetch(`${link}${type}`);
    const $ = load(response);
    const list = $('div.post-list  .post-card')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            const title = item.find('.post-card-title').first();
            return {
                title: title.text(),
                link: a.attr('href'),
                pubDate: parseDate(item.find('.post-card-author-name').next().text().split(' ⋅ ')[0], 'MMM D, YYYY'),
                author: item.find('.post-card-author-name').text(),
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                // item.description = $('body').first().remove('#nav-bar-container').html();
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    header: $('#post-header').html(),
                    description: $('div.content-max-width').html(),
                });
                return item;
            })
        )
    );
    return {
        title: `logrocket-${title}`,
        link,
        description: `logrocket-${title}`,
        item: items,
    };
}
