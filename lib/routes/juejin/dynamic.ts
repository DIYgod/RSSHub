import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/dynamic/:id',
    categories: ['programming'],
    example: '/juejin/dynamic/3051900006845944',
    parameters: { id: '用户 id, 可在用户页 URL 中找到' },
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
            source: ['juejin.cn/user/:id'],
        },
    ],
    name: '用户动态',
    maintainers: ['CaoMeiYouRen'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const response = await got({
        method: 'get',
        url: 'https://api.juejin.cn/user_api/v1/user/dynamic',
        searchParams: {
            user_id: id,
            cursor: 0,
        },
    });
    const list = response.data.data.list;

    const username = list[0].user.user_name;

    const items = list.map((e) => {
        const { target_type, target_data, action, time } = e; // action: 0.发布文章；1.点赞文章；2.发布沸点；3.点赞沸点；4.关注用户
        let title: string | undefined;
        let description: string | undefined;
        let pubDate: Date | undefined;
        let author: string | undefined;
        let link: string | undefined;
        let category: string[] | undefined;
        switch (target_type) {
            case 'short_msg': {
                // 沸点/点赞等
                const { msg_Info, author_user_info, msg_id, topic } = target_data;
                const { content, pic_list, ctime } = msg_Info;
                title = content;
                const imgs = pic_list.map((img) => `<img src="${img}"><br>`).join('');
                description = `${content.replaceAll('\n', '<br>')}<br>${imgs}`;
                pubDate = parseDate(Number(ctime) * 1000);
                author = author_user_info.user_name;
                link = `https://juejin.cn/pin/${msg_id}`;
                category = topic.title;
                if (action === 3) {
                    title = `${username} 赞了这篇沸点//@${author}：${title}`;
                    description = `${username} 赞了这篇沸点//@${author}：${description}`;
                }
                break;
            }
            case 'article': {
                // 文章
                const { article_id, article_info, author_user_info, tags } = target_data;
                const { ctime, brief_content } = article_info;
                title = article_info.title;
                description = brief_content;
                pubDate = parseDate(Number(ctime) * 1000);
                author = author_user_info.user_name;
                link = `https://juejin.cn/post/${article_id}`;
                category = [...new Set([target_data.category.category_name, ...tags.map((t) => t.tag_name)])];
                if (action === 1) {
                    title = `${username} 赞了这篇文章//@${author}：${title}`;
                }
                break;
            }
            case 'user': {
                // 关注用户
                const { user_name, user_id } = target_data;
                title = `${username} 关注了 ${user_name}`;
                description = `${user_name}<br>简介：${target_data.description}`;
                author = user_name;
                link = `https://juejin.cn/user/${user_id}`;
                pubDate = parseDate(time * 1000);
                break;
            }
            default:
                break;
        }
        return {
            title,
            description,
            pubDate,
            author,
            link,
            category,
            guid: link,
        };
    });
    return {
        title: `掘金用户动态-${username}`,
        link: `https://juejin.cn/user/${id}/`,
        description: `掘金用户动态-${username}`,
        item: items,
        author: username,
    };
}
