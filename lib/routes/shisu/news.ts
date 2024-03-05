// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const url = 'https://news.shisu.edu.cn';
const banner = 'https://news.shisu.edu.cn/news/index/39adf3d9ae414bc39c6d3b9316ae531f.png';

export default async (ctx) => {
    const { section = 'news' } = ctx.req.param();
    const { data: r } = await got(`${url}/${section}/index.html`);
    const $ = load(r);
    let itemsoup;
    switch (section) {
        case 'news':
            itemsoup = $('#gallery-wrapper > article')
                .toArray()
                .map((i0) => {
                    const i = $(i0);
                    const img = i.find('img').attr('src');
                    return {
                        title: i.find('a').text().trim(),
                        link: `${url}${i.find('a').attr('href')}`,
                        category: i.find('.in-con02 > span:nth-child(1)').text(),
                        itunes_item_image: `${url}${img}`,
                    };
                });
            break;
        default:
            itemsoup = $('li.clear')
                .toArray()
                .map((i0) => {
                    const i = $(i0);
                    return {
                        title: i.find('h3>a').attr('title').trim(),
                        link: `${url}${i.find('h3>a').attr('href')}`,
                        category: i.find('p>span:nth-child(1)').text(),
                    };
                });
    }
    const items = await Promise.all(
        itemsoup.map((j) =>
            cache.tryGet(j.link, async () => {
                const { data: r } = await got(j.link);
                const $ = load(r);
                const img = $('.tempWrap > ul > li:nth-child(1)> img').attr('src');
                j.description = $('.ot_main_r .content').html();
                j.author = $('.math_time_l > span:nth-child(3)').text().trim();
                j.pubDate = timezone(parseDate($('.math_time_l > span:nth-child(2)').text(), 'YYYY-MM-DD'), +8);
                if (!j.itunes_item_image) {
                    j.itunes_item_image = img ? `${url}${img}` : banner;
                }
                return j;
            })
        )
    );

    ctx.set('data', {
        title: `上外新闻|SISU TODAY -${section.charAt(0).toUpperCase() + section.slice(1)}`,
        image: 'https://bkimg.cdn.bcebos.com/pic/8d5494eef01f3a296b70affa9825bc315c607c4d?x-bce-process=image/resize,m_lfit,w_536,limit_1/quality,Q_70',
        link: `${url}/${section}/index.html`,
        item: items,
    });
};
