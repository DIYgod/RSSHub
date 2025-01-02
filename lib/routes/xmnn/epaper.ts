import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/epaper/:id?',
    categories: ['traditional-media'],
    example: '/xmnn/epaper/xmrb',
    parameters: { id: '报纸 id，见下表，默认为 `xmrb`，即厦门日报' },
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
            source: ['epaper.xmnn.cn/:id'],
            target: '/epaper/:id',
        },
    ],
    name: '数字媒体',
    maintainers: ['nczitzk'],
    handler,
    description: `| 厦门日报 | 厦门晚报 | 海西晨报 | 城市捷报 |
  | -------- | -------- | -------- | -------- |
  | xmrb     | xmwb     | hxcb     | csjb     |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'xmrb';

    const rootUrl = 'https://epaper.xmnn.cn';
    let currentUrl = `${rootUrl}/${id === 'hxcb' ? '/hxcb/epaper/paperindex.htm' : `${id}/`}`;

    let response = await got({
        method: 'get',
        url: currentUrl,
    });

    let $ = load(response.data);

    const title = id === 'hxcb' ? '海西晨报电子版_厦门网' : $('title').text();

    let matches = response.data.match(/window\.location\.href = "(.*?)";/);

    if (!matches) {
        matches = response.data.match(/setTimeout\("javascript:location\.href='(.*?)'", 3000\);/);

        if (!matches) {
            matches = response.data.match(/<meta http-equiv="refresh".*?content=".*?url=(.*?)">/i);
        }
    }

    currentUrl = new URL(matches[1], currentUrl).href;

    response = await got({
        method: 'get',
        url: currentUrl,
    });

    $ = load(response.data);

    $('#pdfsrc').remove();
    $('.bigImg, .smallImg').remove();

    $('a img').each(function () {
        $(this).parent().remove();
    });

    let items = $('.br1, .br2, .titss')
        .find('a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 80)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.attr('href'), currentUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('#qw').remove();

                item.description = content('.cont-b, content').html();
                item.pubDate = timezone(parseDate(content('.time').text() || content('.today').text().split()[0], ['YYYY-MM-DD HH:mm', 'YYYY年MM月DD日']), +8);

                return item;
            })
        )
    );

    return {
        title,
        link: currentUrl,
        item: items,
    };
}
