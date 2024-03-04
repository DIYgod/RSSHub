// @ts-nocheck
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
const { rootUrl } = require('./utils');

export default async (ctx) => {
    const currentUrl = `${rootUrl}/api/pp/api/search/entity-search?per_page=${ctx.req.query('limit') ?? 25}&keyword=${ctx.req.param('keyword')}&entity_type=newsflash`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const items = response.data.data.items.map((item) => ({
        title: item.title,
        link: item.news_url,
        pubDate: timezone(parseDate(item.published_at), +8),
        description: `<p>${item.description}</p>`,
    }));

    ctx.set('data', {
        title: '快讯 - Odaily星球日报',
        link: `${rootUrl}/search/${ctx.req.param('keyword')}`,
        item: items,
    });
};
