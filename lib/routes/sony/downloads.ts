// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
const host = 'https://www.sony.com';
export default async (ctx) => {
    const { productType, productId } = ctx.req.param();
    const url = `${host}/electronics/support/${productType}/${productId}/downloads`;
    const response = await got({
        method: 'get',
        url,
    });
    const data = response.data;

    const $ = load(data);
    const contents = $('script:contains("window.__PRELOADED_STATE__.downloads")').text();

    const regex = /window\.__PRELOADED_STATE__\.downloads\s*=\s*({.*?});\s*window\.__PRELOADED_STATE__/s;

    const match = contents.match(regex);
    let results = {};
    if (match) {
        results = JSON.parse(match[1]).searchResults.results;
    }
    const list = results.map((item) => {
        const data = {};
        data.title = item.title;
        data.pubDate = item.publicationDate;
        const url = item.url;
        if (url.startsWith('http')) {
            data.url = url;
        } else if (url.startsWith('//')) {
            data.url = 'https:' + url;
        } else {
            data.url = host + url;
        }
        return data;
    });
    ctx.set('data', {
        title: `Sony - ${productId.toUpperCase()}`,
        link: url,
        description: `Sony - ${productId.toUpperCase()}`,
        item: list.map((item) => ({
            title: item.title,
            guid: item.title + ' - ' + item.url,
            link: item.url,
            pubDate: item.pubDate,
        })),
    });
};
