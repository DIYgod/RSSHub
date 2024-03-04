// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { defaultDomain, renderDescription } = require('./utils');

export default async (ctx) => {
    const keyword = ctx.req.param('keyword');
    const currentUrl = `${defaultDomain}/webmasters/search?search=${keyword}`;
    const response = await got(currentUrl);

    const list = response.data.videos.map((item) => ({
        title: item.title,
        link: item.url,
        description: renderDescription({ thumbs: item.thumbs }),
        pubDate: parseDate(item.publish_date),
        category: [...new Set([...item.tags.map((t) => t.tag_name), ...item.categories.map((c) => c.category)])],
    }));

    ctx.set('data', {
        title: `Pornhub - ${keyword}`,
        link: currentUrl,
        item: list,
    });
};
