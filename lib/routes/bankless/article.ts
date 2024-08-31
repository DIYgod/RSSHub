import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const baseUrl =
    'https://phantomjscloud.com/api/browser/v2/ak-17y47-kr42k-dmnbg-ehnya-27v91/?request=%7B%22url%22%3A%22https%3A%2F%2Fwww.bankless.com%2Fread%22%2C%22renderType%22%3A%22html%22%2C%22requestSettings%22%3A%7B%22userAgent%22%3A%22Mozilla%2F5.0%20%28Macintosh%3B%20Intel%20Mac%20OS%20X%2010_15_5%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F100.0.4896.81%20Safari%2F537.36%22%7D%7D';
export const route: Route = {
    path: '/article',
    categories: ['finance'],
    example: '/bankless/article',
    radar: [
        {
            source: ['bankless.com/read'],
        },
    ],
    name: 'Articles',
    maintainers: ['colin4k'],
    handler,
};
async function handler() {
    const response = await ofetch(baseUrl);
    const $ = load(response);

    const list = $('.item.articleBlockSmall')
        .toArray()
        .slice(0, 40)
        .map((u) => {
            const $u = $(u);
            const item = {
                title: $u.find('.title').text(),
                link: $u.attr('href'),
            };
            return item;
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                const urlList = $('#article').first();
                const $u = $(urlList);
                item.description = $u.find('#focalAnchor.contents').html();
                const src = $u.find('img').prop('src');
                const alt = $u.find('img').prop('alt');
                item.image = { src, alt };
                item.pubDate = parseDate($u.find('#intro .meta.wow.fadeInUp').children('span')[1].childNodes[0].data);
                item.author = $u.find('#intro .meta.wow.fadeInUp .authorName').text();
                return item;
            })
        )
    );
    // console.log(items);
    return {
        title: 'Bankless Articles',
        link: baseUrl,
        description: 'Bankless is a global community to help you on your crypto journey.',
        item: items,
    };
}
