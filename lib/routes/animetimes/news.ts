import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.animatetimes.com';

export const route: Route = {
    path: '/news/:page?',
    categories: ['new-media'],
    example: '/animatetimes/news',
    parameters: { page: '页码，对应网站 `index.php?p=页码`，默认为 1（最新一页）' },
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
            source: ['animatetimes.com/', 'animatetimes.com/index.php'],
            target: '/news',
        },
    ],
    name: '最新記事一覧',
    maintainers: ['your-github-id'],
    handler,
    url: 'animatetimes.com',
};

async function handler(ctx) {
    const page = ctx.req.param('page') || '1';
    const listUrl = `${baseUrl}/index.php?p=${page}`;

    const response = await ofetch(listUrl);
    const $ = load(response);

    // 真实结构（对照 index.php?p=2 抓取的 HTML）：
    // <ul class="c-headline-list">
    //   <li class="c-headline-item">
    //     <a class="c-headline-link" href="https://www.animatetimes.com/news/details.php?id=xxxx">
    //       <div class="c-headline-img"><div class="thumb-placeholder"><img src="..." alt="标题(备用)"></div></div>
    //       <div class="c-headline-meta">
    //         <div class="c-headline-text">标题</div>
    //         <div class="c-headline-date">2026-07-31 18:00</div>
    //         <div class="c-label c-label--xxx">分类（仅部分区块出现）</div>
    //       </div>
    //     </a>
    //   </li>
    //   ...
    // </ul>
    // 页面下方还有一个「人気ランキング」区块，结构相同但 li 多了 class="ranking"，
    // 需要排除；另外列表中间还夹杂着纯广告位的 <li class="c-headline-item ...">（没有
    // a.c-headline-link / .c-headline-text），靠最后 filter 掉没有标题或链接的项即可。
    const items = $('.c-headline-list > li.c-headline-item')
        .toArray()
        .filter((el) => !$(el).hasClass('ranking'))
        .map((el) => {
            const $li = $(el);
            const $a = $li.find('a.c-headline-link').first();

            const link = $a.attr('href') ?? '';
            const title = $li.find('.c-headline-text').first().text().trim();
            const cover = $li.find('.c-headline-img img').first().attr('src') ?? '';
            const dateText = $li.find('.c-headline-date').first().text().trim();
            const categoryText = $li.find('.c-label').first().text().trim();

            return {
                title,
                link,
                description: cover ? `<img src="${cover}"><br>${title}` : title,
                pubDate: dateText ? timezone(parseDate(dateText, 'YYYY-MM-DD HH:mm'), +9) : undefined,
                category: categoryText ? [categoryText] : [],
                guid: link,
            };
        })
        // 过滤掉广告位等没有标题/链接的“伪条目”
        .filter((item) => item.link && item.title);

    return {
        title: 'アニメイトタイムズ - 最新記事一覧',
        link: listUrl,
        item: items,
        language: 'ja',
    };
}
