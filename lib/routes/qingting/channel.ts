import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
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
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const channelUrl = `https://i.qingting.fm/capi/v3/channel/${ctx.req.param('id')}`;
    let response = await ofetch(channelUrl);
    const title = response.data.title;
    const programUrl = `https://i.qingting.fm/capi/channel/${ctx.req.param('id')}/programs/${response.data.v}?curpage=1&order=asc`;
    response = await ofetch(programUrl);

    const items = response.data.programs.map((item) => ({
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
                    response = await ofetch(item.link);
                    const data = JSON.parse(response.match(/},"program":(.*?),"plist":/)[1]);
                    item.description = data.richtext;
                    return item;
                })
            )
        ),
    };
}
