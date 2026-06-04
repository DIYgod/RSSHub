import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.nowcoder.com';

export const route: Route = {
    path: '/experience/:tagId',
    categories: ['bbs'],
    example: '/nowcoder/experience/639?order=3&companyId=665&phaseId=0',
    parameters: { tagId: '职位id [🔗查询链接](https://www.nowcoder.com/profile/all-jobs)复制打开' },
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
            source: ['nowcoder.com/'],
            target: '/experience',
        },
    ],
    name: '面经',
    maintainers: ['huyyi'],
    handler,
    url: 'nowcoder.com/',
    description: `可选参数：

- companyId：公司 id，[🔗查询链接](https://www.nowcoder.com/discuss/tag/exp), 复制打开
- order：3 - 最新；1 - 最热
- phaseId：0 - 所有；1 - 校招；2 - 实习；3 - 社招`,
};

async function handler(ctx) {
    const params = new URLSearchParams(ctx.req.query());
    params.append('tagId', ctx.req.param('tagId'));

    const link = new URL('/discuss/experience/json', host);

    // const link = `https://www.nowcoder.com/discuss/experience/json?tagId=${tagId}&order=${order}&companyId=${companyId}&phaseId=${phaseId}`;
    link.search = params;
    const response = await got.get(link.toString());
    const data = response.data.data;

    const list = data.discussPosts.map((x) => {
        const info = {
            title: x.postTitle,
            link: new URL('discuss/' + x.postId, host).href,
            author: x.author,
            pubDate: timezone(parseDate(x.createTime), +8),
            category: x.postTypeName,
        };
        return info;
    });

    const out = await Promise.all(
        list.map((info) =>
            cache.tryGet(info.link, async () => {
                const response = await got.get(info.link);
                const $ = load(response.data);

                info.description = $('.nc-post-content').html();

                return info;
            })
        )
    );

    return {
        title: `牛客面经Tag${ctx.req.param('tagId')}`,
        link: link.href,
        item: out,
    };
}
