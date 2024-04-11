import { Route } from '@/types';
import cache from '@/utils/cache';
import { getArchive, getCategories, parseList, parseItem } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/news/:region/:category?',
    categories: ['new-media'],
    example: '/yahoo/news/hk/world',
    parameters: { region: 'Region, see the table below', category: 'Category, see the table below' },
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
            source: ['yahoo.com/'],
        },
    ],
    name: 'News',
    maintainers: ['KeiLongW'],
    handler,
    url: 'yahoo.com/',
    description: `\`Region\`

  | Hong Kong | Taiwan | US |
  | --------- | ------ | -- |
  | hk        | tw     | en |

  <details>
    <summary>\`Category\` (Hong Kong)</summary>

    | 全部     | 港聞      | 兩岸國際 | 財經     | 娛樂          | 體育   | 健康   | 親子      | 副刊       |
    | -------- | --------- | -------- | -------- | ------------- | ------ | ------ | --------- | ---------- |
    | （留空） | hong-kong | world    | business | entertainment | sports | health | parenting | supplement |
  </details>

  <details>
    <summary>\`Category\` (Taiwan)</summary>

    | 全部     | 政治     | 財經    | 娛樂          | 運動   | 社會地方 | 國際  | 生活      | 健康   | 科技       | 品味  |
    | -------- | -------- | ------- | ------------- | ------ | -------- | ----- | --------- | ------ | ---------- | ----- |
    | （留空） | politics | finance | entertainment | sports | society  | world | lifestyle | health | technology | style |
  </details>

  <details>
    <summary>\`Category\` (US)</summary>

    | All     | World | Business | Entertainment | Sports | Health |
    | ------- | ----- | -------- | ------------- | ------ | ------ |
    | (Empty) | world | business | entertainment | sports | health |
  </details>`,
};

async function handler(ctx) {
    const { region, category } = ctx.req.param();
    if (!['hk', 'tw'].includes(region)) {
        throw new InvalidParameterError(`Unknown region: ${region}`);
    }

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;
    const categoryMap = await getCategories(region, cache.tryGet);
    const tag = category ? categoryMap[category].yctMap : null;

    const response = await getArchive(region, limit, tag);
    const list = parseList(region, response);

    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    return {
        title: `Yahoo 新聞 - ${category ? categoryMap[category].name : '所有類別'}`,
        link: `https://${region}.news.yahoo.com/${category ? `${category}/` : ''}archive`,
        image: 'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png',
        item: items,
    };
}
