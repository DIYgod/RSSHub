import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import randUserAgent from '@/utils/rand-user-agent';
import { generate_a_bogus } from './a-bogus';
import { Feed } from './types';
import RejectError from '@/errors/types/reject';
import { config } from '@/config';

export const route: Route = {
    path: '/user/token/:token',
    categories: ['new-media'],
    example: '/toutiao/user/token/MS4wLjABAAAAEmbqJP2CmC8XXv1BpMvQ3sQHKAxFsq8wHxj8XVIQWja6tMcB-QEbFkzkRNgMl12M',
    parameters: { token: '用户 token，可在用户主页 URL 找到' },
    features: {
        antiCrawler: true,
    },
    radar: [
        {
            source: ['www.toutiao.com/c/user/token/:token'],
        },
    ],
    name: '头条主页',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { token } = ctx.req.param();
    const ua = randUserAgent({ browser: 'chrome', os: 'windows', device: 'desktop' });

    const feed = (await cache.tryGet(`toutiao:user:${token}`, async () => {
        const query = `category=profile_all&token=${token}&max_behot_time=0&entrance_gid&aid=24&app_name=toutiao_web`;

        const data = await ofetch(`https://www.toutiao.com/api/pc/list/feed?${query}&a_bogus=${generate_a_bogus(query, ua)}`, {
            headers: {
                'User-Agent': ua,
            },
        });

        return data.data;
    },config.cache.routeExpire,
        false
)) as Feed[];

    if (!feed) {
        throw new RejectError('无法获取用户信息');
    }

    const items = feed.map((item) => {
        const enclosure = item.large_image_list?.pop();
        return {
            title: item.title,
            description: item.rich_content ?? item.abstract ?? item.content,
            link: `https://www.toutiao.com/${item.cell_type === 60 ? 'article' : /* 32 */ 'w'}/${item.id}/`,
            pubDate: parseDate(item.publish_time, 'X'),
            author: item.user_info?.name ?? item.user?.name ?? item.source,
            enclosure_url: enclosure?.url,
            enclosure_type: enclosure?.url ? `image/${new URL(enclosure.url).pathname.split('.').pop()}` : undefined,
        };
    });

    return {
        title: `${feed[0].user_info?.name ?? feed[0].user?.name ?? feed[0].source}的头条主页 - 今日头条(www.toutiao.com)`,
        description: feed[0].user_info?.description ?? feed[0].user?.desc,
        link: `https://www.toutiao.com/c/user/token/${token}/`,
        image: feed[0].user_info?.avatar_url ?? feed[0].user?.avatar_url,
        item: items,
    };
}
