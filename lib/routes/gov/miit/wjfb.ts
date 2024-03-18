import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.miit.gov.cn';

export const route: Route = {
    path: '/miit/wjfb/:ministry',
    categories: ['government'],
    example: '/gov/miit/wjfb/ghs',
    parameters: { ministry: '部门缩写，可以在对应 URL 中获取' },
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
            source: ['miit.gov.cn/jgsj/:ministry/wjfb/index.html'],
        },
    ],
    name: '文件发布',
    maintainers: ['Fatpandac'],
    handler,
};

async function handler(ctx) {
    const ministry = ctx.req.param('ministry');
    const url = `${rootUrl}/jgsj/${ministry}/wjfb/index.html`;

    const cookieResponse = await got(url);
    const cookie = cookieResponse.headers['set-cookie'][0].split(';')[0];
    const indexContent = load(cookieResponse.data);
    const title = indexContent('div.dqwz > a:nth-child(4)').text();
    const dataRequestUrl = indexContent('div.lmy_main_rb > script:nth-child(2)')
        .map((_, item) => ({
            url: `${rootUrl}${indexContent(item).attr('url')}`,
            queryData: JSON.parse(indexContent(item).attr('querydata').replaceAll('"', '|').replaceAll("'", '"').replaceAll('|', '"')),
        }))
        .get()[0];

    const dataUrl = `${dataRequestUrl.url}?${Object.keys(dataRequestUrl.queryData)
        .map((key) => `${key}=${dataRequestUrl.queryData[key]}`)
        .join('&')}`;
    const response = await got({
        method: 'get',
        url: dataUrl,
        headers: {
            Cookie: cookie,
        },
    });
    const $ = load(response.data.data.html);
    const list = $('ul > li')
        .map((_, item) => ({
            title: $(item).find('a').text(),
            link: new URL($(item).find('a').attr('href'), rootUrl).href,
            pubDate: parseDate($(item).find('span').text(), 'YYYY-MM-DD'),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.description = content('#con_con')
                    .html()
                    .replaceAll(/(<iframe.*?src=")(.*?)(".*?>)/g, '$1' + rootUrl + '$2' + '$3');

                return item;
            })
        )
    );

    return {
        title: `工业和信息化部 - ${title} 文件发布`,
        link: url,
        item: items,
    };
}
