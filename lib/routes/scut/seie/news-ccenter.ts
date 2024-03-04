// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://www2.scut.edu.cn';
    const url = `${rootUrl}/ee/16285/list.htm`;
    const response = await got(url);
    const $ = load(response.data);

    const list = $('.news_ul li');
    const articleList = list.toArray().map((item) => {
        item = $(item);
        const titleElement = item.find('.news_title a');
        return {
            title: titleElement.attr('title'),
            link: titleElement.attr('href'),
            pubDate: parseDate(item.find('.news_meta').text(), 'YYYY-MM-DD'),
        };
    });

    const items = await Promise.all(
        articleList.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(`${rootUrl}${item.link}`);
                const content = load(detailResponse.data);

                content('.wp_articlecontent *').each((_, child) => {
                    const childElem = content(child);
                    childElem.removeAttr('style');
                    childElem.removeAttr('lang');
                    childElem.removeAttr('original-src');
                    childElem.removeAttr('sudyfile-attr');
                    childElem.removeAttr('data-layer');
                    if ((!childElem.text().replace('\n', '').trim().length && !childElem.has('img')) || childElem.attr('name') === '_GoBack' || childElem.is('style')) {
                        childElem.remove();
                    }
                });

                const contentHTML = content('.wp_articlecontent').html();
                item.description = contentHTML.replaceAll(/^(<br>)+|(<br>)+$/g, '').trim();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: '华南理工大学电子与信息学院 - 新闻速递',
        link: url,
        item: items,
    });
};
