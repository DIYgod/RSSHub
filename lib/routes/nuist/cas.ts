import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseTitle = 'NUIST AS（南信大大气科学学院）';
const baseUrl = 'https://cas.nuist.edu.cn';

export const route: Route = {
    path: '/cas/:category?',
    categories: ['university'],
    example: '/nuist/cas/xxgg',
    parameters: { category: '默认为信息公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'NUIST AS（南信大大气科学学院）',
    maintainers: ['gylidian'],
    handler,
    description: `| 信息公告 | 新闻快讯 | 科学研究 | 网上公示 | 本科教育 | 研究生教育 |
| -------- | -------- | -------- | -------- | -------- | ---------- |
| xxgg     | xwkx     | kxyj     | wsgs     | bkjy     | yjsjy      |`,
};

async function handler(ctx) {
    const { category = 'xxgg' } = ctx.req.param();
    const link = `${baseUrl}/index/${category}.htm`;

    const response = await got(link);
    const $ = load(response.data);
    const list = $('#ctl00_ctl00_body_NewsList')
        .find('tr.gridline')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.Title').text().trim(),
                link: new URL(item.find('.Title').attr('href'), baseUrl).href,
                pubDate: parseDate(
                    item
                        .find('td')
                        .eq(2)
                        .text()
                        .replaceAll(/[[\]]+/g, ''),
                    'YYYY.MM.DD'
                ),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                let response;
                try {
                    response = await got(item.link);
                    const $ = load(response.data);

                    const authorMatch = $('.zzxx')
                        .text()
                        .match(/作者:(.*) 发布时间/);
                    item.author = authorMatch ? authorMatch[1].trim() : null;
                    item.pubDate = timezone(
                        parseDate(
                            item
                                .find('.zzxx')
                                .text()
                                .match(/发布时间:(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/)[1]
                        ),
                        +8
                    );
                    item.description = $('#vsb_content').html();
                } catch {
                    // intranet
                }

                return item;
            })
        )
    );

    return {
        title: baseTitle + '：' + $('.dqlm').find('a').eq(1).text(),
        description: $('meta[name=description]').attr('content'),
        link,
        item: items,
    };
}
