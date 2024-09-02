import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const baseUrl = 'https://www.bankless.com/read';
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
    // const response = await ofetch(baseUrl);
    const flaresolverr_url = 'http://localhost:8191/v1';
    const payload = {
        cmd: 'request.get',
        url: baseUrl,
        maxTimeout: 60000,
    };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // 如果发送JSON数据
            // 或者如果是表单数据：
            // 'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload, // 如果是JSON格式
        // 或者如果是表单数据：
        // body: new URLSearchParams(formData).toString()
        parseResponse: JSON.parse,
    };
    const res = await ofetch(flaresolverr_url, options);
    // console.log(res);
    const response = await res.solution.response;
    // console.log(response);
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
                // const response = await ofetch(item.link);
                const _payload = {
                    cmd: 'request.get',
                    url: item.link,
                    maxTimeout: 60000,
                };
                const _options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // 如果发送JSON数据
                        // 或者如果是表单数据：
                        // 'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: _payload, // 如果是JSON格式
                    // 或者如果是表单数据：
                    // body: new URLSearchParams(formData).toString()
                    parseResponse: JSON.parse,
                };
                const res = await ofetch(flaresolverr_url, _options);
                const response = await res.solution.response;
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
