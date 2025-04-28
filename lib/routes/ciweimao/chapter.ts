import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/chapter/:id',
    categories: ['reading'],
    example: '/ciweimao/chapter/100043404',
    parameters: { id: '小说 id, 可在对应小说页 URL 中找到' },
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
            source: ['wap.ciweimao.com/book/:id'],
        },
    ],
    name: '章节',
    maintainers: ['keocheung'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = Number.parseInt(ctx.req.query('limit')) || 10;

    const baseUrl = 'https://wap.ciweimao.com';
    const chapterUrl = 'https://mip.ciweimao.com';

    const { data: response } = await got(`${baseUrl}/book/${id}`);
    const $ = load(response);

    const firstChapterUrl = $('ul.catalogue-list li a').attr('href');
    const firstChapterId = firstChapterUrl.slice(firstChapterUrl.lastIndexOf('/') + 1);

    const { data: chapters } = await got(`${chapterUrl}/chapter/${id}/${firstChapterId}`);
    const $c = load(chapters);

    const list = $c('ul.book-chapter li a')
        .slice(-limit)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                chapterLocked: item.find('h3 i.icon-lock').length > 0,
                title: item.find('h3').text(),
                pubDate: timezone(parseDate(item.find('p').text().replace('发布于 ', '')), +8),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.chapterLocked) {
                    return item;
                }
                const { data: response } = await got(item.link);
                const $ = load(response);

                const content = $('div.read-bd');
                content.find('span, a').remove();
                content.find('p').removeAttr('class');
                item.description = content.html();

                return item;
            })
        )
    );

    return {
        title: `刺猬猫 ${$('.book-name').text()}`,
        link: `${baseUrl}/book/${id}`,
        description: $('.book-desc div p').text(),
        image: $('meta[name=image]').attr('content'),
        item: items,
    };
}
