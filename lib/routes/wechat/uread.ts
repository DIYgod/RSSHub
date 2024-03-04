// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const userid = ctx.req.param('userid');
    const url = `http://119.29.146.143:8080/reading/subscription/account/recent?uid=${userid}`;
    const response = await got({
        method: 'get',
        url,
    });
    const data = response.data;

    const ProcessFeed = (data) => {
        const $ = load(data);
        return $('.rich_media_content').html();
    };

    const items = await Promise.all(
        data.data.map(async (item) => {
            const link = item.url;

            const cacheIn = await cache.get(link);
            if (cacheIn) {
                return JSON.parse(cacheIn);
            }

            const response = await got({
                method: 'get',
                url: link,
            });

            const description = ProcessFeed(response.data);

            const single = {
                title: item.title,
                description,
                link,
                author: item.official_account,
                pubDate: item.publish_time,
            };
            cache.set(link, JSON.stringify(single));
            return single;
        })
    );

    ctx.set('data', {
        title: `优读 - ${userid}`,
        link: 'https://uread.ai/',
        item: items,
    });
};
