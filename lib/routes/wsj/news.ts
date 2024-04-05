import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { asyncPoolAll, parseArticle } from './utils';
const hostMap = {
    'en-us': 'https://www.wsj.com',
    'zh-cn': 'https://cn.wsj.com/zh-hans',
    'zh-tw': 'https://cn.wsj.com/zh-hant',
};
export const route: Route = {
    path: '/:lang/:category?',
    categories: ['traditional-media'],
    example: '/wsj/en-us/opinion',
    parameters: { lang: 'Language, `en-us`, `zh-cn`, `zh-tw`', category: 'Category. See below' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['oppilate'],
    handler,
    description: `en\_us

  | World | U.S. | Politics | Economy | Business | Tech       | Markets | Opinion | Books & Arts | Real Estate | Life & Work | Sytle               | Sports |
  | ----- | ---- | -------- | ------- | -------- | ---------- | ------- | ------- | ------------ | ----------- | ----------- | ------------------- | ------ |
  | world | us   | politics | economy | business | technology | markets | opinion | books-arts   | realestate  | life-work   | style-entertainment | sports |

  zh-cn / zh-tw

  | 国际  | 中国  | 金融市场 | 经济    | 商业     | 科技       | 派        | 专栏与观点 |
  | ----- | ----- | -------- | ------- | -------- | ---------- | --------- | ---------- |
  | world | china | markets  | economy | business | technology | life-arts | opinion    |

  Provide full article RSS for WSJ topics.`,
};

async function handler(ctx) {
    const lang = ctx.req.param('lang');
    const category = ctx.req.param('category') || '';
    const host = hostMap[lang];
    let subTitle = ` - ${lang.toUpperCase()}`;
    let url = host;
    if (category.length > 0) {
        url = `${host}/news/${category}`;
        subTitle = `${subTitle} - ${category}`;
    }
    const response = await got({
        method: 'get',
        url,
    });

    const $ = load(response.data);
    const contents = $('script:contains("window.__STATE__")').text();
    const data = JSON.parse(contents.match(/{.*}/)[0]).data;
    const filteredKeys = Object.entries(data)
        .filter(([key, value]) => {
            if (!key.startsWith('article')) {
                return false;
            }
            const link = value.data.data.url;
            return link.includes('wsj.com/articles/');
        })
        .map(([key]) => key);
    const list = filteredKeys.map((key) => {
        const item = {};
        item.title = data[key].data.data.headline;
        item.link = data[key].data.data.url;
        item.test = key;
        return item;
    });
    const items = await asyncPoolAll(10, list, (item) => parseArticle(item));

    return {
        title: `WSJ${subTitle}`,
        link: url,
        description: `WSJ${subTitle}`,
        item: items,
    };
}
