import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import iconv from 'iconv-lite';

const rootUrl = 'http://news.inewsweek.cn';

export const route: Route = {
    path: '/:channel',
    categories: ['traditional-media'],
    example: '/inewsweek/survey',
    parameters: { channel: '栏目' },
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
            source: ['inewsweek.cn/:channel', 'inewsweek.cn/'],
        },
    ],
    name: '栏目',
    maintainers: ['changren-wcr'],
    handler,
    description: `提取文章全文。

  | 封面  | 时政     | 社会    | 经济    | 国际  | 调查   | 人物   |
  | ----- | -------- | ------- | ------- | ----- | ------ | ------ |
  | cover | politics | society | finance | world | survey | people |`,
};

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const url = `${rootUrl}/${channel}`;
    const response = await got(url, {
        responseType: 'buffer',
    });
    const $ = load(iconv.decode(response.data, 'gbk'));
    const items = await Promise.all(
        $('div.grid-item')
            .toArray()
            .map((item) => {
                item = $(item);
                const href = item.find('a').attr('href');
                const articleLink = `${rootUrl}${href}`;
                return cache.tryGet(articleLink, async () => {
                    const response = await got(articleLink, {
                        responseType: 'buffer',
                    });

                    const $ = load(iconv.decode(response.data, 'gbk'));
                    const fullText = $('div.contenttxt').html();
                    const time = timezone(
                        parseDate(
                            $('div.editor')
                                .html()
                                .split(/(\s\s+)/)[2]
                        ),
                        +8
                    );
                    return {
                        title: item.find('p').text(),
                        description: fullText,
                        link: articleLink,
                        pubDate: time,
                    };
                });
            })
    );

    return {
        title: $('title').text(),
        link: url,
        item: items,
    };
}
