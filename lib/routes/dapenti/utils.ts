import { load } from 'cheerio';
import iconv from 'iconv-lite';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

export default {
    parseFeed: async ({ subjectid: subjectId }) => {
        const url = `https://www.dapenti.com/blog/blog.asp?name=xilei&subjectid=${subjectId}`;
        const listRes = await got({
            method: 'get',
            url,
            headers: {
                Referer: url,
            },
            // Fetch binary data before decoding the site's legacy GBK encoding.
            responseType: 'buffer',
        });
        const data = iconv.decode(listRes.data, 'gb2312');
        const $ = load(data);
        // Fetch the latest three entries with their full public content.
        const list = $('li', 'ul').slice(0, 3).toArray();

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(`https://www.dapenti.com/blog/${$(item).find('a').attr('href')}`, async () => {
                    const el = $(item);
                    const url = `https://www.dapenti.com/blog/${el.find('a').attr('href')}`;
                    const articleResponse = await got({
                        method: 'get',
                        url,
                        headers: {
                            Referer: url,
                        },
                        responseType: 'buffer',
                    });
                    const articleHtml = iconv.decode(articleResponse.data, 'gbk');
                    const $article = load(articleHtml);
                    const description = $article('body > table > tbody > tr > td.oblog_t_2 > div > table > tbody > tr:nth-child(2) > td');
                    const pubInfo = description.find('span span.oblog_text').text().split('发布于');
                    const bodyStart = description.children('p[style="margin:2px 2px 2px 2px;"]').first();
                    bodyStart.prevAll().remove();
                    if (subjectId.toString() === '70') {
                        const dailyStart = description
                            .children()
                            .filter((_, element) => $article(element).text().trim() === '每天一图卦，让我们更清楚地了解这个世界')
                            .first();
                        dailyStart.prevAll().remove();
                    }
                    const footer = description
                        .children()
                        .filter((_, element) => $article(element).text().trimStart().startsWith('【无需App在移动设备上看喷嚏】'))
                        .first();
                    footer.nextAll().remove();
                    footer.remove();
                    description.find('style, .adsbygoogle').remove();
                    const single = {
                        title: el.text(),
                        author: pubInfo[0].trim(),
                        description: description.html(),
                        pubDate: parseDate(pubInfo[1].trim(), 8),
                        link: url,
                    };
                    return single;
                })
            )
        );

        return {
            title: `喷嚏-${subjectId}`,
            link: url,
            item: items,
        };
    },
};
