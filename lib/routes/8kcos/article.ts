import { load } from 'cheerio';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

async function loadArticle(link) {
    const resp = await got(link);
    const article = load(resp.body);
    const entryChildren = article('div.entry-content').children();
    const imgs = entryChildren
        .find('noscript')
        .toArray()
        .map((e) => e.children[0].data);
    const txt = entryChildren
        .slice(2)
        .toArray()
        .map((e) => load(e).html());
    return {
        title: article('.entry-title').text(),
        description: [...imgs, ...txt].join(''),
        pubDate: parseDate(article('time')[0].attribs.datetime),
        link,
    };
}
export default loadArticle;
