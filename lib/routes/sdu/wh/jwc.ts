import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import data from '../data';
import extractor from '../extractor';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/wh/jwc/:column?',
    categories: ['university'],
    example: '/sdu/wh/jwc/gztz',
    parameters: { column: '专栏名称，默认为工作通知（`gztz`）' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处',
    maintainers: ['kxxt'],
    handler,
    description: `| 规章制度 | 专业建设 | 实践教学 | 支部风采 | 服务指南 | 教务要闻 | 工作通知 | 教务简报 | 常用下载 |
  | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
  | gzzd     | zyjs     | sjjx     | zbfc     | fwzn     | jwyw     | gztz     | jwjb     | cyxz     |`,
};

async function handler(ctx) {
    const column = ctx.req.param('column') ?? 'gztz';
    const baseUrl = data.wh.jwc.url;
    const response = await got(baseUrl + data.wh.jwc.columns[column].url);
    const $ = load(response.data);
    const items = $('.articleul li');
    const out = await Promise.all(
        items.map(async (index, item) => {
            item = $(item);
            const anchor = item.find('a');
            const dateElement = item.find('div:last-of-type');
            const dateText = dateElement.text();
            dateElement.remove();
            const href = anchor.attr('href');
            const link = href.startsWith('http') ? href : baseUrl + href;
            const title = item.text();
            const { description, author: exactAuthor, exactDate } = await cache.tryGet(link, () => extractor(link));
            const author = exactAuthor ?? '教务处';
            const pubDate = exactDate ?? timezone(parseDate(dateText.slice(1, -1), 'YYYY-MM-DD'), +8);
            return {
                title,
                link,
                description,
                pubDate,
                author,
            };
        })
    );

    return {
        title: `${data.wh.jwc.name} ${data.wh.jwc.columns[column].name}`,
        link: baseUrl + data.wh.jwc.columns[column].url,
        item: out,
    };
}
