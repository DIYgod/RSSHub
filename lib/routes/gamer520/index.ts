import { Data, DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import { Context } from 'hono';

export const route: Route = {
    path: '/:category?/:order?/:price?',
    categories: ['game'],
    example: '/gamer520/switchyouxi',
    parameters: {
        category: '分类，见下表',
        order: '排序，见下表',
        price: '价格, 全部:0;免费1;付费:2;',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '全球游戏交流中心',
    maintainers: ['xzzpig'],
    handler,
    url: 'www.gamer520.com/',
    description: `分类

  | Switch游戏下载 | 金手指 | 3A巨作 | switch主题 | PC游戏 | PC游戏下载 | 模拟器大全 | 听我所听 |
  | --- | --- | --- | --- | --- | --- | --- | --- |
  | switchyouxi | jinshouzhi | 3ajuzuo | zhuti | pcgame | pcgame | zhangji | ting |
  
  排序
  
  | 发布日期 | 修改日期 | 评论数量 | 随机 | 热度 |
  | --- | --- | --- | --- | --- |
  | date | modified | comment_count | rand | hot |`,
};

async function handler(ctx?: Context): Promise<Data> {
    const category = ctx?.req.param('category') ?? 'switchyouxi';
    const order = ctx?.req.param('order');
    const price = ctx?.req.param('price');

    const currentUrl = new URL(`https://www.gamer520.com/${category}`);
    if (order !== undefined) {
        currentUrl.searchParams.set('order', order);
    }
    if (price !== undefined) {
        currentUrl.searchParams.set('cao_type', price);
    }

    const response = await got(currentUrl);
    const $ = load(response.data as any);

    const selector = `main article`;
    const items: DataItem[] = $(selector)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $titleItem = $item.find('.entry-title a');
            return {
                title: $titleItem.text().trim(),
                link: $titleItem.attr('href')!,
                pubDate: parseDate($item.find('time').attr('datetime')?.trim() ?? ''),
                category: $item
                    .find('a[rel="category"]')
                    .toArray()
                    .map((a) => $(a).text().trim()),
                description: $item.html() ?? '',
            };
        });

    return {
        title: '全球游戏交流中心-' + $('title').text(),
        link: currentUrl.toString(),
        allowEmpty: true,
        item: items,
    };
}
