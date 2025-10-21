import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    name: 'IEEE Journal Articles',
    maintainers: ['HappyZhu99'],
    categories: ['journal'],
    path: '/journal/:journalID',
    parameters: {
        journalID: 'journal ID, can be found in the URL',
    },
    example: '/ieee/journal/aiaaj',
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('journalID');

    const baseUrl = 'https://arc.aiaa.org';
    const rssUrl = `${baseUrl}/action/showFeed?type=etoc&feed=rss&jc=${id}`;

    const pageResponse = await ofetch(rssUrl);
    const items = pageResponse.map((item) => ({
        // 文章标题
        title: item.title,
        // 文章链接
        link: item.html_url,
        // 文章正文
        description: item.body_html,
        // 文章发布日期
        pubDate: parseDate(item.created_at),
        // 如果有的话，文章作者
        author: item.user.login,
        // 如果有的话，文章分类
        category: item.labels.map((label) => label.name),
    }));

    // items.description = $page('meta[name="description"]').attr('content') || '';

    return {
        title: ` | arc.aiaa.org`,
        description: '',
        link: rssUrl,
        item: items,
    };
}
