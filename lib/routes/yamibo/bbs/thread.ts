import type { Data, DataItem, Route } from '@/types';
import type { Context } from 'hono';
import { load } from 'cheerio';
import { fetchThread, generateDescription, getDate, bbsOrigin } from '../utils';

export const route: Route = {
    name: 'BBS - 讨论串',
    categories: ['bbs'],
    path: '/bbs/thread/:tid',
    example: '/yamibo/bbs/thread/541914',
    parameters: {
        tid: '讨论串 id，可从URL中提取。https://bbs.yamibo.com/forum.php?mod=viewthread&tid=xxxx中的xxx或https://bbs.yamibo.com/thread-aaa-b-c.html中的aaa部分即为tid值',
    },
    maintainers: ['KarasuShin'],
    handler,
    features: {
        antiCrawler: true,
        requireConfig: [
            {
                optional: true,
                name: 'YAMIBO_SALT',
                description:
                    '百合会BBS登录后的认证信息，获取方式：1. 登录百合会BBS网页版 2. 打开浏览器开发者工具，切换到 Application 面板\n3. 点击侧边栏中的Storage -> Cookies -> https://bbs.yamibo.com 4. 复制 Cookie 中的 EeqY_2132_saltkey 值',
            },
            {
                optional: true,
                name: 'YAMIBO_AUTH',
                description:
                    '百合会BBS登录后的认证信息，获取方式：1. 登录百合会BBS网页版 2. 打开浏览器开发者工具，切换到 Application 面板\n3. 点击侧边栏中的Storage -> Cookies -> https://bbs.yamibo.com 4. 复制 Cookie 中的 EeqY_2132_auth 值',
            },
        ],
    },
    description: `::: warning
百合会BBS访问部分讨论串需要用户登录认证，请参考配置说明
:::`,
};

async function handler(ctx: Context): Promise<Data> {
    const tid = ctx.req.param('tid');

    const { data, link } = await fetchThread(tid, { ordertype: '1' });

    if (!data) {
        return {
            title: '讨论串不存在',
            link,
            item: [],
        };
    }

    const $ = load(data);
    const title = $('title').text().replace(' -  百合会 -  Powered by Discuz!', '');
    const items: DataItem[] = $('#postlist>div[id^="post_"]')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const isOP = !!$item.has('#fj').length;
            const postId = $item.attr('id')!.match(/\d+/)![0];
            const $tr = $item.find('table').find('tr').first();
            const profileBlock = $tr.find(`#favatar${postId}`);
            const nickName = profileBlock.find('.authi').text();
            const floor = isOP ? '主楼' : $tr.find(`#postnum${postId} em`).text();
            const link = isOP ? `${bbsOrigin}/forum.php?mod=viewthread&tid=${tid}` : `${bbsOrigin}/forum.php?mod=redirect&goto=findpost&ptid=${tid}&pid=${postId}`;
            const description = generateDescription($item, postId);

            const createTime = $tr
                .find(`#authorposton${postId}`)
                .text()
                .match(/\d{4}(?:-\d{1,2}){2} \d{2}:\d{2}/)![0];

            return {
                title: `${floor} - ${nickName}`,
                link,
                description,
                pubDate: getDate(createTime),
            };
        });

    return {
        title,
        link,
        item: items,
    };
}
