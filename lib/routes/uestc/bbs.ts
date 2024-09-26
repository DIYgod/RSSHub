import { Route } from '@/types';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库
import { parseDate } from '@/utils/parse-date'; // 解析日期的工具函数
import timezone from '@/utils/timezone';
import { config } from '@/config';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/bbs/:types?',
    name: '清水河畔',
    maintainers: ['huyyi'],
    categories: ['university'],
    url: 'bbs.uestc.edu.cn',
    example: '/uestc/bbs/newthread',
    parameters: { types: '选择内容类型(多选`,`分割），可选值：[newreply,newthread,digest,life,hotlist]。默认为所有。' },
    features: {
        requireConfig: [
            {
                name: 'UESTC_BBS_COOKIE',
                optional: false,
                description: '河畔的cookie',
            },
            {
                name: 'UESTC_BBS_AUTH_KEY',
                optional: false,
                description: '河畔Header中的authorization字段',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    description: `
:::tip
仅支持自建，您需要设置以下配置才能正常使用：
-   河畔cookie: \`UESTC_BBS_COOKIE\`
-   Header中的授权字段: \`UESTC_BBS_AUTH_KEY\`
:::
`,
    radar: [
        {
            source: ['bbs.uestc.edu.cn/*'],
            target: '/bbs/newthread',
        },
    ],
    handler: async (ctx) => {
        const { bbsCookie, bbsAuthStr } = config.uestc;
        if (!bbsCookie || !bbsAuthStr) {
            throw new ConfigNotFoundError('未配置 Cookie 或 Authorization。请检查配置。');
        }
        const { types = 'newreply,newthread,digest,life,hotlist' } = ctx.req.param();
        const data = await ofetch(`https://bbs.uestc.edu.cn/star/api/v1/index?top_list=${types}`, {
            headers: {
                Cookie: bbsCookie,
                Referer: 'https://bbs.uestc.edu.cn/new',
                authorization: bbsAuthStr,
            },
        });
        const itemsRaw = Object.entries(data.data.top_list).flatMap(([label, items]) => items.map((item) => ({ ...item, label })));
        const items = await Promise.all(
            itemsRaw.map((item) =>
                cache.tryGet(`https://bbs.uestc.edu.cn/forum.php?mod=viewthread&tid=${item.thread_id}`, async () => {
                    const response = await ofetch(`https://bbs.uestc.edu.cn/forum.php?mod=viewthread&tid=${item.thread_id}`, {
                        headers: {
                            Cookie: bbsCookie,
                            Referer: 'https://bbs.uestc.edu.cn',
                            authorization: bbsAuthStr,
                        },
                    });
                    const $ = load(response);
                    item.description = $('div#postlist').html();
                    return {
                        title: item.subject,
                        link: `https://bbs.uestc.edu.cn/thread/${item.thread_id}`,
                        author: item.author,
                        category: item.label,
                        img: item.icon,
                        pubDate: timezone(parseDate(item.dateline), +8),
                        description: item.description,
                    };
                })
            )
        );
        return {
            // 源标题
            title: '清水河畔',
            // 源链接
            link: 'https://bbs.uestc.edu.cn/new',
            // 源文章
            item: items,
        };
    },
};
