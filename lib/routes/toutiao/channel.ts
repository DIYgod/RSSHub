import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { generateHeaders } from '@/utils/header-generator';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { generate_a_bogus } from './a-bogus';
import type { Feed, UserInfoCell32 } from './types';

const channels = {
    recommend: { id: '0', name: '推荐' },
    news_hot: { id: '3189398996', name: '热点' },
    news_tech: { id: '3189398999', name: '科技' },
    news_finance: { id: '3189399007', name: '财经' },
    news_entertainment: { id: '3189398972', name: '娱乐' },
    news_sports: { id: '3189398957', name: '体育' },
    news_world: { id: '3189398968', name: '国际' },
    news_military: { id: '3189398960', name: '军事' },
    news_history: { id: '3189398965', name: '历史' },
    news_essay: { id: '3189399001', name: '美文' },
    news_food: { id: '3189399002', name: '美食' },
    news_travel: { id: '3189398983', name: '旅游' },
    news_fashion: { id: '3189398984', name: '时尚' },
    news_game: { id: '3189398995', name: '游戏' },
    news_baby: { id: '3189399004', name: '育儿' },
    news_regimen: { id: '3189398959', name: '养生' },
    digital: { id: '3189398981', name: '数码' },
    video: { id: '3431225546', name: '视频' },
};

export const route: Route = {
    path: '/channel/:category',
    categories: ['new-media'],
    example: '/toutiao/channel/news_tech',
    parameters: {
        category: {
            description: '频道',
            options: Object.entries(channels).map(([value, { name }]) => ({ value, label: name })),
        },
    },
    features: {
        antiCrawler: true,
    },
    radar: [
        {
            source: ['www.toutiao.com/ch/:category'],
        },
        {
            title: '推荐',
            source: ['www.toutiao.com/'],
            target: '/channel/recommend',
        },
    ],
    name: '频道',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx: Context) {
    const { category } = ctx.req.param();
    const channel = channels[category];
    if (!channel) {
        throw new InvalidParameterError('Unknown channel');
    }

    const query = new URLSearchParams({
        channel_id: channel.id,
        category: channel.id === '0' ? 'pc_profile_recommend' : 'pc_profile_channel',
        aid: '24',
        app_name: 'toutiao_web',
    }).toString();
    const ua = generateHeaders()['user-agent'];
    const { data } = await ofetch<{ data: Feed[] }>(`https://www.toutiao.com/api/pc/list/feed?${query}&a_bogus=${generate_a_bogus(query, ua)}`, {
        headers: { 'user-agent': ua },
    });

    const list = data
        .filter((item) => item.cell_type !== 48) // empty placeholder
        .map((item) => {
            const categories = [...new Set(Object.keys(JSON.parse(item.optional_data?.mm_category_three ?? '{}')).flatMap((key) => key.split('/')))];
            if (item.cell_type === 32) {
                // microblog post
                const user = item.user as UserInfoCell32 | undefined;
                return {
                    title: item.content.split('\n', 1)[0],
                    description: item.rich_content + (item.large_image_list ?? []).map((image) => `<img src="${image.url}">`).join(''),
                    link: `https://www.toutiao.com/w/${item.id}/`,
                    pubDate: parseDate(item.publish_time, 'X'),
                    author: user?.name,
                    category: categories,
                };
            }
            return {
                title: item.title,
                description: item.Abstract,
                link: `https://www.toutiao.com/${item.has_video ? 'video' : 'article'}/${item.group_id}/`,
                pubDate: parseDate(item.publish_time, 'X'),
                author: item.source,
                category: categories,
                image: item.large_image_list?.[0]?.url ?? item.middle_image?.url,
                groupId: item.group_id,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.groupId) {
                    const { data } = await ofetch<{ data: { content: string } | null }>(`https://m.toutiao.com/i${item.groupId}/info/`);
                    if (data) {
                        const $ = load(data.content, null, false);
                        $('.tt-video-box').remove();
                        item.description = $.html();
                    }
                    item.description = (item.image ? `<img src="${item.image}">` : '') + item.description;
                }
                return item;
            })
        )
    );

    return {
        title: `${channel.name} - 今日头条`,
        link: category === 'recommend' ? 'https://www.toutiao.com/' : `https://www.toutiao.com/ch/${category}/`,
        item: items,
    };
}
