import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:path{.+}?',
    categories: ['new-media'],
    example: '/bad',
    parameters: { path: '路径，默认为首页热门' },
    description: `若订阅 [每日热点 - 最新](https://bad.news/tag/每日热点/sort-new)，网址为 \`https://bad.news/tag/每日热点/sort-new\`。截取 \`https://bad.news\` 到末尾的部分 \`/tag/每日热点/sort-new\` 作为参数，此时路由为 [\`/bad/tag/每日热点/sort-new\`](https://rsshub.app/bad/tag/每日热点/sort-new)。

若订阅子分类 [大陆资讯 - 热门](https://bad.news/tag/大陆资讯/sort-hot)，网址为 \`https://bad.news/tag/大陆资讯/sort-hot\`。截取 \`https://bad.news\` 到末尾的部分 \`/tag/大陆资讯/sort-hot\` 作为参数，路由为 [\`/bad/tag/大陆资讯/sort-hot\`](https://rsshub.app/bad/tag/大陆资讯/sort-hot)。`,
    name: '通用',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const rootUrl = 'https://bad.news';
    const path = ctx.req.param('path');
    const currentUrl = path ? `${rootUrl}/${path}` : rootUrl;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('.option, .pagination').remove();

    const items = $('.entry')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a.title');

            item.find('img').each((_, el) => {
                $(el).attr('src', $(el).attr('data-echo'));
                $(el).removeClass('lazy');
                $(el).removeAttr('data-echo');
                $(el).removeAttr('id');
            });

            item.find('video').each((_, el) => {
                $(el).attr('poster', $(el).attr('data-echo'));
                $(el).removeAttr('data-echo');
                $(el).removeAttr('onerror');
                $(el).removeAttr('id');
            });

            return {
                title: a.text(),
                link: a.attr('href'),
                description: item.find('.coverdiv').html(),
                author: item.find('.author').text().trim(),
                pubDate: timezone(parseDate(item.find('time').attr('datetime')), 8),
                category: item
                    .find('.label')
                    .toArray()
                    .map((l) => $(l).text().trim()),
            };
        });

    return {
        title: `Bad.news - ${$('.active').text()}${$('.selected').text()}`,
        link: currentUrl,
        item: items,
    };
}
