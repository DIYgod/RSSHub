// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.nowcoder.com';

export default async (ctx) => {
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

    ctx.set('data', {
        title: `牛客面经Tag${ctx.req.param('tagId')}`,
        link: link.href,
        item: out,
    });
};
