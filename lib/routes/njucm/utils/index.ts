import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

async function getNoticeList(ctx, url, host, listSelector, titleSelector, contentSelector) {
    const response = await got(url);
    const $ = load(response.data);

    const list = $(listSelector)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find(titleSelector).attr('title'),
                link: host + item.find(titleSelector).attr('href'),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                if (response.redirectUrls.length) {
                    item.link = response.redirectUrls[0];
                    item.description = '该通知无法直接预览，请点击原文链接↑查看';
                } else {
                    const $ = load(response.data);
                    item.title = $(contentSelector.title).text();
                    item.description = $(contentSelector.content)
                        .html()
                        .replaceAll('src="/', `src="${new URL('.', host).href}`)
                        .replaceAll('href="/', `href="${new URL('.', host).href}`)
                        .trim();
                    item.pubDate = timezone(parseDate($(contentSelector.date).text()), +8);
                }
                return item;
            })
        )
    );

    return out;
}

export { getNoticeList };
