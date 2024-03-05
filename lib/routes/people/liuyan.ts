// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const fid = ctx.req.param('id');
    const state = ctx.req.param('state') ?? '1';

    const rootUrl = 'http://liuyan.people.com.cn';
    const currentUrl = `${rootUrl}/threads/list?fid=${fid}#state=${state}`;

    let currentForum;

    const apiResponse = await got({
        method: 'post',
        url: `${rootUrl}/threads/queryThreadsList`,
        form: {
            fid,
            state,
            lastItem: 0,
        },
    });

    const list = apiResponse.data.responseData.map((item) => ({
        title: item.subject,
        author: item.nickName,
        link: `${rootUrl}/threads/content?tid=${item.tid}`,
        pubDate: parseDate(item.threadsCheckTime * 1000),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.content').html();
                currentForum = currentForum ?? content('#currentForum').text();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${currentForum} - 领导留言板 - 人民网`,
        link: currentUrl,
        item: items,
    });
};
