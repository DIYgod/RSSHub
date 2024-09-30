import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.soundofhope.org';

export const route: Route = {
    path: '/:channel/:id',
    categories: ['traditional-media'],
    example: '/soundofhope/term/203',
    parameters: { channel: '频道', id: '子频道 ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['soundofhope.org/:channel/:id'],
        },
    ],
    name: '频道',
    maintainers: ['Fatpandac'],
    handler,
    description: `参数均可在官网获取，如：

  \`https://www.soundofhope.org/term/203\` 对应 \`/soundofhope/term/203\``,
};

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const id = ctx.req.param('id');
    const url = `${host}/${channel}/${id}`;

    const response = await got(url);
    const $ = load(response.data);
    const title = $('div.left > nav').text().split('/').slice(1).join('');
    const list = $('div.item')
        .map((_, item) => ({
            title: $(item).find('div.title').text(),
            link: new URL($(item).find('a').attr('href'), host).href,
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.description = content('div.Content__Wrapper-sc-1bvya0-0').html();
                item.pubDate = timezone(parseDate(content('div.date').text(), 'YYYY.M.D HH:mm'), -8);

                return item;
            })
        )
    );

    return {
        title: `希望之声 - ${title}`,
        link: url,
        item: items,
    };
}
