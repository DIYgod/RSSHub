import { Route } from '@/types';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库
import { load } from 'cheerio'; // 类似 jQuery 的 API HTML 解析器
import { parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:relativePath',
    name: 'THE BANKER',
    url: 'www.thebanker.com',
    maintainers: ['benjaminyzhang'],
    handler,
    example: '/thebanker/News-in-Brief',
    parameters: { relativePath: '想读路径可在对应网页列表的 URL 中找到，默认为NEWS IN BRIEF' },
    description: `
  | NEWS IN BRIEF | Investment-banking |
  | ---------- | ------ |
  | News-in-Brief | Banking-strategies/Investment-banking    |
    `,
    categories: ['finance'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [

    ],
};


export const handler = async (ctx) => {
    const { category = 'News-in-Brief' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const rootUrl = 'https://www.thebanker.com';
    const currentUrl = new URL(category ? `${category}/` : '', rootUrl).href;

    const response = await ofetch(currentUrl);

    const $ = load(response);


    // 我们使用 Cheerio 选择器选择所有带类名“js-navigation-container”的“div”元素，
    // 其中包含带类名“flex-auto”的子元素。
    // const items = $('div#layout-content-wrapper > div > div:nth-of-type(2) > div > div > div > div > div:nth-of-type(2) > div:nth-of-type(2)')
    // const items = $('div[data-trackable-section="artcile-stream"] div[type="horizCard"] div[type="horizCard"]')
    const items = $('div[data-trackable-section="article-stream"] > div[type="horizCard"]')
        // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
        .toArray()
        // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
        .map((item) => {
            const itemSelector = $(item);
            // 提取标题，假设标题在具有 data-cy="card-title-link 的 a 标签内的 h3 中
            const title = itemSelector.find('> div[type="horizCard"] > div:nth-child(2) > a[data-cy="card-title-link"] > h3').text().trim();
            // 提取链接，确保是绝对链接
            const link = `https://www.thebanker.com${itemSelector.find('> div[type="horizCard"] > div:nth-child(2) > a[data-cy="card-title-link"]').attr('href')}`;
            // 提取发布日期，假设它在当前 horizCard 的第一个子 div 中的第一个子 div 中
            const pubDate = parseRelativeDate(itemSelector.find('> div[type=\"horizCard\"] > div:nth-child(1) > div').text().trim());

            return {
                title,
                link,
                pubDate,
                item: items,
            };
        }
        );
