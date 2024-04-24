import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { isValidHost } from '@/utils/valid-host';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { parseArticle } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/:column/:category',
    categories: ['traditional-media'],
    example: '/caixin/finance/regulation',
    parameters: { column: '栏目名', category: '栏目下的子分类名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    name: '新闻分类',
    maintainers: ['idealclover'],
    handler,
    description: `Column 列表：

  | 经济    | 金融    | 政经  | 环科    | 世界          | 观点网  | 文化    | 周刊   |
  | ------- | ------- | ----- | ------- | ------------- | ------- | ------- | ------ |
  | economy | finance | china | science | international | opinion | culture | weekly |

  以金融板块为例的 category 列表：（其余 column 以类似方式寻找）

  | 监管       | 银行 | 证券基金 | 信托保险         | 投资       | 创新       | 市场   |
  | ---------- | ---- | -------- | ---------------- | ---------- | ---------- | ------ |
  | regulation | bank | stock    | insurance\_trust | investment | innovation | market |

  Category 列表：

  | 封面报道   | 开卷  | 社论      | 时事             | 编辑寄语     | 经济    | 金融    | 商业     | 环境与科技              | 民生    | 副刊   |
  | ---------- | ----- | --------- | ---------------- | ------------ | ------- | ------- | -------- | ----------------------- | ------- | ------ |
  | coverstory | first | editorial | current\_affairs | editor\_desk | economy | finance | business | environment\_technology | cwcivil | column |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const column = ctx.req.param('column');
    const url = `https://${column}.caixin.com/${category}`;
    if (!isValidHost(column)) {
        throw new InvalidParameterError('Invalid column');
    }

    const response = await got(url);

    const $ = load(response.data);
    const title = $('head title').text();
    const entity = JSON.parse(
        $('script')
            .text()
            .match(/var entity = ({.*?})/)[1]
    );

    const {
        data: { datas: data },
    } = await got('https://gateway.caixin.com/api/extapi/homeInterface.jsp', {
        searchParams: {
            subject: entity.id,
            type: 0,
            count: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25,
            picdim: '_266_177',
            start: 0,
        },
    });

    const list = data.map((item) => ({
        title: item.desc,
        description: item.summ,
        link: item.link.replace('http://', 'https://'),
        pubDate: timezone(parseDate(item.time), +8),
        category: item.keyword.split(' '),
        audio: item.audioUrl,
        audio_image_url: item.pict.imgs[0].url,
    }));

    const items = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    return {
        title,
        link: url,
        description: '财新网 - 提供财经新闻及资讯服务',
        item: items,
    };
}
