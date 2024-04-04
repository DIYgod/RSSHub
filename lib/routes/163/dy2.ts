import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { parseDyArticle } from './utils';

export const route: Route = {
    path: '/dy2/:id',
    categories: ['new-media'],
    example: '/163/dy2/T1555591616739',
    parameters: { id: 'id，该网易号主页网址最后一项 html 的文件名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '网易号（通用）',
    maintainers: ['mjysci', 'lyqluis'],
    handler,
    description: `优先使用方法一，若是网易号搜索页面搜不到的小众网易号（文章页面不含\`data-wemediaid\`）则可使用此法。
触发反爬会只抓取到标题，建议自建。`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ?? 30;
    const url = `https://www.163.com/dy/media/${id}.html`;
    const res = await got(url);
    const $ = load(res.data);

    const list = $('.tab_content ul li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);
            const itemImg = item.find('a.img img');
            return {
                title: item.find('h4 a').text(),
                link: item.find('a').first().attr('href'),
                pubDate: timezone(parseDate(item.find('.time').text()), 8),
                imgsrc: itemImg.attr('src') ?? itemImg.attr('_src'),
            };
        });

    const items = await Promise.all(list.map((item) => parseDyArticle(item, cache.tryGet)));

    return {
        title: `${$('head title').text()} - 网易号`,
        link: url,
        description: $('.icon_line.desc').text(),
        image: $('.head_img').attr('src'),
        item: items,
        author: $('h2').text(),
    };
}
