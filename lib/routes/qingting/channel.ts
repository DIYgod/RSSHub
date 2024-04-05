import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/channel/:id',
    categories: ['multimedia'],
    example: '/qingting/channel/293411',
    parameters: { id: '专辑id, 可在专辑页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '专辑',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const channelUrl = `https://i.qingting.fm/capi/v3/channel/${ctx.req.param('id')}`;
    let response = await got(channelUrl);
    const title = response.data.data.title;
    const programUrl = `https://i.qingting.fm/capi/channel/${ctx.req.param('id')}/programs/${response.data.data.v}?curpage=1&pagesize=10&order=asc`;
    response = await got(programUrl);

    const items = response.data.data.programs.map((item) => ({
        title: item.title,
        link: `https://www.qingting.fm/channels/${ctx.req.param('id')}/programs/${item.id}/`,
        pubDate: timezone(parseDate(item.update_time), +8),
    }));

    return {
        title: `${title} - 蜻蜓FM`,
        link: `https://www.qingting.fm/channels/${ctx.req.param('id')}`,
        item: await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link, async () => {
                    response = await got(item.link);
                    const data = JSON.parse(response.data.match(/},"program":(.*?),"plist":/)[1]);
                    item.description = data.richtext;
                    return item;
                })
            )
        ),
    };
}
