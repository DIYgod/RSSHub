import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog/:id?/:page?',
    categories: ['new-media'],
    example: '/sakurazaka46/blog',
    parameters: { id: 'Member ID, see below, `all` by default', page: 'Page, `0` by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Sakurazaka46 Blog 櫻坂 46 博客',
    maintainers: ['victor21813', 'nczitzk', 'akashigakki'],
    handler,
    description: `Member ID

| Member ID | Name         |
| --------- | ------------ |
| 2000      | 三期生リレー |
| 69        | 山下 瞳月    |
| 68        | 村山 美羽    |
| 67        | 村井 優      |
| 66        | 向井 純葉    |
| 65        | 的野 美青    |
| 64        | 中嶋 優月    |
| 63        | 谷口 愛季    |
| 62        | 小島 凪紗    |
| 61        | 小田倉 麗奈  |
| 60        | 遠藤 理子    |
| 59        | 石森 璃花    |
| 58        | 守屋 麗奈    |
| 57        | 増本 綺良    |
| 56        | 幸阪 茉里乃  |
| 55        | 大沼 晶保    |
| 54        | 大園 玲      |
| 53        | 遠藤 光莉    |
| 51        | 山﨑 天      |
| 50        | 森田 ひかる  |
| 48        | 松田 里奈    |
| 47        | 藤吉 夏鈴    |
| 46        | 田村 保乃    |
| 45        | 武元 唯衣    |
| 44        | 関 有美子    |
| 43        | 井上 梨名    |
| 15        | 原田 葵      |
| 14        | 土生 瑞穂    |
| 11        | 菅井 友香    |
| 08        | 齋藤 冬優花  |
| 07        | 小林 由依    |
| 06        | 小池 美波    |
| 04        | 尾関 梨香    |
| 03        | 上村 莉菜    |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? 'all';
    const page = ctx.req.param('page') ?? '0';

    const rootUrl = 'https://sakurazaka46.com';
    const params = id === 'all' ? `?page=${page}` : `?page=${page}&ct=${id}`;
    const currentUrl = `${rootUrl}/s/s46/diary/blog/list${params}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.com-blog-part .box a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                author: item.find('.name').text(),
                link: `${rootUrl}${item.attr('href').split('?')[0]}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.box-article').html();
                item.pubDate = timezone(parseDate(content('.blog-foot .date').text()), +9);

                return item;
            })
        )
    );

    return {
        title: `${$('title').text()}${id ? ` - ${$('.name').first().text()}` : ''}`,
        link: currentUrl,
        item: items,
    };
}
