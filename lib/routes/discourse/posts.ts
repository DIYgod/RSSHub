// @ts-nocheck
const { getConfig } = require('./utils');
import got from '@/utils/got';
import RSSParser from '@/utils/rss-parser';

export default async (ctx) => {
    const { link, key } = getConfig(ctx);

    const feed = await RSSParser.parseString(
        (
            await got(`${link}/posts.rss`, {
                headers: {
                    'User-Api-Key': key,
                },
            })
        ).data
    );

    feed.items = feed.items.map((e) => ({
        description: e.content,
        author: e.creator,
        ...e,
    }));

    ctx.set('data', { item: feed.items, ...feed });
};
