import type { Data, DataItem, Route } from '@/types';
import type { Context } from 'hono';
import { config } from '@/config';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { fetchThread, generateDescription, getDate, bbsOrigin } from '../utils';
import pMap from 'p-map';
import cache from '@/utils/cache';

export const route: Route = {
    name: 'BBS - 板块',
    categories: ['bbs'],
    path: '/bbs/forum/:fid/:type?',
    example: '/yamibo/bbs/forum/5/404',
    parameters: {
        fid: '板块 id，可从URL中提取。https://bbs.yamibo.com/forum-aa-b.html中的aa部分即为fid值',
        type: '板块子分类，网页中选中板块分类后URL中的typeid值',
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
百合会BBS访问部分板块需要用户登录认证，请参考配置说明
:::`,
};

async function handler(ctx: Context): Promise<Data> {
    const fid = ctx.req.param('fid');
    const type = ctx.req.param('type');
    const { auth, salt } = config.yamibo;

    const params = new URLSearchParams();
    params.set('mod', 'forumdisplay');
    params.set('fid', fid);
    params.set('orderby', 'dateline');
    if (type) {
        params.set('filter', 'typeid');
        params.set('typeid', type);
    }
    const headers: HeadersInit = {};

    if (auth && salt) {
        headers.cookie = `EeqY_2132_saltkey=${salt}; EeqY_2132_auth=${auth}`;
    }

    const link = `${bbsOrigin}/forum.php?${params.toString()}`;

    const $ = load(await ofetch<string>(link, { headers }));

    const title = $('title').text().replace(' -  百合会 -  Powered by Discuz!', '');

    let items: DataItem[] = $('tbody[id^="normalthread_"]')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const id = $item.attr('id')!.match(/\d+/)![0];
            const title = $item.find('th em').text() + $item.find('th .s.xst').text();
            const link = `${bbsOrigin}/thread-${id}-1-1.html`;
            const pubDate = getDate($item.find('td.by').first().find('em').text());

            return {
                id,
                title,
                link,
                pubDate,
            };
        });

    items = await pMap(
        items,
        async (item) =>
            (await cache.tryGet(item.link!, async () => {
                let description: string | undefined;
                const { data } = await fetchThread(item.id!);
                if (data && !data.startsWith('<script type="text/javascript">')) {
                    const $ = load(data);
                    if ($('#postlist>div[id^="post_"]').length) {
                        const op = $('#postlist>div[id^="post_"]').first();
                        const postId = op.attr('id')?.match(/\d+/)?.[0];
                        if (postId) {
                            description = generateDescription(op, postId);
                        }
                    }
                }

                return {
                    title: item.title,
                    link: item.link,
                    description,
                    pubDate: item.pubDate,
                };
            })) as DataItem,
        { concurrency: 5 }
    );

    return {
        title,
        link,
        item: items,
    };
}
