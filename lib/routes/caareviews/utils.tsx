import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'http://www.caareviews.org';

const getList = async (url) => {
    const response = await got(url);
    const $ = load(response.data);
    const list = $('#infinite-content > div')
        .toArray()
        .map((item) => ({
            title: $(item).find('div.title').text().trim(),
            link: new URL($(item).find('div.title > em > a').attr('href')!, rootUrl).href,
            author: $(item)
                .find('div.reviewer a')
                .toArray()
                .map((author) => $(author).text())
                .join(', '),
        }));

    return list;
};

const getItems = (_context, list) =>
    Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);

                const coverPath = $('div.cover > a').attr('href');
                const coverUrl = coverPath ? new URL(coverPath, rootUrl).href : undefined;
                $('div.review_heading, div.content.full-review > div.reviewer').remove();
                const content = $('div.content.full-review').html();
                item.description = renderToString(
                    <>
                        {coverUrl ? <img src={coverUrl} /> : null}
                        {raw(content ?? '')}
                    </>
                );
                item.pubDate = parseDate($('div.header-text > div.clearfix').text());
                item.doi = $('div.crossref > a').attr('href')!.replace('http://dx.doi.org/', '');

                return item;
            })
        )
    );

export { getItems, getList, rootUrl };
