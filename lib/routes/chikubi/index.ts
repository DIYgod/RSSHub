import { Route, Data } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { processItems } from './utils';

export const route: Route = {
    path: '/:category?',
    categories: ['multimedia'],
    example: '/chikubi',
    parameters: { category: '分類，見下表，默認爲最新' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['snowagar25'],
    handler,
    description: `| 最新 | 殿堂 | 動畫 | VR | 漫畫 | 音聲 | CG |
  | ------ | ---- | ----- | -- | ----- | ----- | -- |
  | (empty) | best | video | vr | comic | voice | cg |`,
    radar: [
        {
            source: ['chikubi.jp/:category', 'chikubi.jp/'],
            target: '/:category',
        },
    ],
};

const categoryMap = {
    '': { url: '/page/1', title: '最新', selector: '.article_list_area > article > a' },
    best: { url: '/best-nipple-article', title: '殿堂', selector: '.article-list:first .title > a' },
    video: { url: '/nipple-video', title: '動畫', selector: 'ul.video_list > li > a' },
    vr: { url: '/nipple-video-category/cat-nipple-video-vr', title: 'VR', selector: 'ul.video_list > li > a' },
    comic: { url: '/comic', title: '漫畫', selector: '.section:nth-of-type(2) .list-doujin .photo a' },
    voice: { url: '/voice', title: '音聲', selector: 'ul.list-doujin > li > .photo > a' },
    cg: { url: '/cg', title: 'CG', selector: 'ul.list-doujin > li > .photo > a' },
};

async function handler(ctx): Promise<Data> {
    const category = ctx.req.param('category') ?? '';
    const baseUrl = 'https://chikubi.jp';

    const { url, title, selector } = categoryMap[category];

    const response = await got(`${baseUrl}${url}`);
    const $ = load(response.data);

    let list = $(selector)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text().trim(),
                link: new URL($item.attr('href') ?? '', baseUrl).href,
            };
        });

    // 限制殿堂最多獲取30個
    if (category === 'best') {
        list = list.slice(0, 30);
    }

    // 獲取內文
    const items = await processItems(list);

    return {
        title: `${title} - chikubi.jp`,
        link: `${baseUrl}${url}`,
        item: items,
    };
}
