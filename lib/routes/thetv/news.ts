import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://thetv.jp';

// thetv.jp/news/ 下的一级分类
const categoryNameMap: Record<string, string> = {
    news: '芸能ニュース',
    drama: 'ドラマ',
    variety: 'バラエティー',
    movie: '映画',
    music: '音楽・アイドル',
    anime: 'アニメ・2.5次元',
    gravure: 'グラビア',
    comic: 'コミック',
};

export const route: Route = {
    path: '/news/:category?',
    categories: ['new-media'],
    example: '/thetv/news/anime',
    parameters: {
        category: {
            description: '新闻分类，默认为全部新闻（news）',
            options: Object.entries(categoryNameMap).map(([value, label]) => ({ value, label })),
            default: 'news',
        },
    },
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
            source: ['thetv.jp/news/:category?'],
            target: '/news/:category',
        },
    ],
    name: 'ニュース一覧',
    maintainers: ['your-github-id'],
    handler,
    url: 'thetv.jp/news',
};

async function handler(ctx) {
    const category = ctx.req.param('category') || 'news';
    // news（全部）没有单独子目录，其余分类都是 /news/:category/
    const listUrl = category === 'news' ? `${baseUrl}/news/` : `${baseUrl}/news/${category}/`;

    const response = await ofetch(listUrl);
    const $ = load(response);

    // 真实结构：
    // <ul class=masonrylist>
    //   <li class=masonrylist__item>
    //     <a href=/news/detail/xxxx/></a>            <-- 链接，无文字/图片
    //     <img class=item-img alt="标题" src="...">   <-- 与 a 同级，不是嵌套在 a 里
    //     <div class=label__block><a class=label-xxx>分类文字</a>...</div>
    //     <p class=item-text>标题</p>
    //     <div class=timestamp>2026/07/31 18:55</div>
    //   <li class=masonrylist__item> ...
    // </ul>
    // “新着ニュース”区块可能有多个 ul.masonrylist（中间插了广告），
    // 侧边栏排行榜用的是 ul.rankinglist，class 不同，天然不会被下面的选择器选中。
    const items = $('ul.masonrylist > li.masonrylist__item')
        .toArray()
        .map((el) => {
            const $li = $(el);

            const href = $li.find('a').first().attr('href') ?? '';
            const link = href.startsWith('http') ? href : `${baseUrl}${href}`;

            const $img = $li.find('img.item-img').first();
            const title = $li.find('p.item-text').first().text().trim() || ($img.attr('alt') ?? '').trim();

            const coverSrc = $img.attr('src') ?? '';
            const cover = coverSrc ? (coverSrc.startsWith('http') ? coverSrc : `${baseUrl}${coverSrc}`) : '';

            const tags = $li
                .find('div.label__block a')
                .toArray()
                .map((tag) => $(tag).text().trim())
                .filter(Boolean);

            const dateText = $li.find('div.timestamp').first().text().trim();

            return {
                title,
                link,
                description: cover ? `<img src="${cover}"><br>${title}` : title,
                pubDate: dateText ? timezone(parseDate(dateText, 'YYYY/MM/DD HH:mm'), +9) : undefined,
                category: tags,
                guid: link,
            };
        })
        // 保险起见按链接去重（正常情况下不会重复，但防止页面结构变化产生脏数据）
        .filter((item, index, all) => all.findIndex((i) => i.link === item.link) === index);

    return {
        title: `WEBザテレビジョン - ${categoryNameMap[category] ?? category}`,
        link: listUrl,
        item: items,
        language: 'ja',
    };
}
