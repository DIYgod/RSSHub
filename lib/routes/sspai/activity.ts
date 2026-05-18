import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/activity/:slug',
    categories: ['new-media'],
    example: '/sspai/activity/urfp0d9i',
    parameters: { slug: '作者 slug，可在作者主页URL中找到' },
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
            source: ['sspai.com/u/:id/updates'],
            target: '/activity/:id',
        },
    ],
    name: '作者动态',
    maintainers: ['umm233'],
    handler,
};

async function handler(ctx) {
    const slug = ctx.req.param('slug');
    const link = `https://sspai.com/u/${slug}/updates`;

    const response = await got({
        method: 'get',
        url: `https://sspai.com/api/v1/information/user/activity/page/get?limit=10&offset=0&slug=${slug}`,
        headers: {
            Referer: link,
        },
    });

    const response_user = await got({
        method: 'get',
        url: `https://sspai.com/api/v1/user/slug/info/get?slug=${slug}`,
        headers: {
            Referer: link,
        },
    });

    const user_data = response_user.data.data;
    const user_nickname = user_data.nickname;

    const data = response.data.data;
    let item_title = '';
    let item_desc = '';
    let item_url = '';

    return {
        title: `少数派用户「${user_nickname}」动态更新`,
        link,
        description: `少数派用户「${user_nickname}」的动态更新`,

        item: data.map((item) => {
            const content_data = item.data;
            const nicknames = [];
            const slugs = [];
            // 根据用户action，选择输出
            switch (item.key) {
                case 'follow_user':
                    // 遍历关注的用户，生成title及desc
                    for (const i in content_data) {
                        nicknames[i] = content_data[i].nickname;
                        slugs[i] = `<a href=https://sspai.com/u/${content_data[i].slug}/updates>${content_data[i].nickname}</a>`;
                    }
                    item_title = `${item.author.nickname}${item.action}：${nicknames.join('、')}`;
                    item_desc = `${item.author.nickname}${item.action}：${slugs.join('、')}`;
                    item_url = `https://sspai.com/u/${slug}/follow`;
                    break;
                case 'like_article':
                    item_title = `${item.author.nickname}${item.action}：${content_data.title}`;
                    item_desc = `文章简介：<br>${content_data.summary}`;
                    item_url = `https://sspai.com/post/${content_data.id}`;
                    break;
                case 'comment_article':
                    item_title = `${item.author.nickname}${item.action}：${content_data.article_title}`;
                    item_desc = content_data.comment;
                    item_url = `https://sspai.com/post/${content_data.article_id}`;
                    break;
                case 'release_article':
                    item_title = `${item.author.nickname}${item.action}：${content_data.title}`;
                    item_desc = content_data.summary;
                    item_url = `https://sspai.com/post/${content_data.id}`;
                    break;
                case 'chosen_comment':
                    item_title = `${item.author.nickname}在文章「${content_data.article_title}」下的${item.action}`;
                    item_desc = content_data.comment;
                    item_url = content_data.comment;
                    break;
                default:
                    throw new Error(`Unknown action key: ${item.key}`);
            }

            return {
                title: item_title,
                description: item_desc,
                link: item_url,
                pubDate: parseDate(item.created_at * 1000),
            };
        }),
    };
}
