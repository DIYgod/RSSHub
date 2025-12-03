import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch'; // 使用ofetch库代替got
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

async function getNoticeList(ctx, url, host, titleSelector, dateSelector, contentSelector) {
    const response = await ofetch(url, { rejectUnauthorized: false });
    if (!response) {
        return [];
    }
    const $ = load(response);

    const list = $(`tr[height=20]`)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find(titleSelector).attr('title'),
                link: new URL(item.find(titleSelector).attr('href'), host).href,
                pubDate: timezone(parseDate(item.find(dateSelector).text().trim(), 'YYYY-MM-DD'), +8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.link.includes('.jsp')) {
                    // 特殊处理.jsp文件，直接显示消息而不尝试爬取
                    return {
                        ...item,
                        description: '该通知无法直接预览，请点击原文链接↑查看',
                    };
                }
                const response = await ofetch(item.link, { rejectUnauthorized: false });
                if (!response || (response.status >= 300 && response.status < 400)) {
                    item.description = '该通知无法直接预览，请点击原文链接↑查看';
                } else {
                    const $ = load(response);

                    item.title = $(contentSelector.title).text();
                    const hasEmbeddedPDFScript = $('script:contains("showVsbpdfIframe")').length > 0;

                    if (hasEmbeddedPDFScript) {
                        item.description = '该通知无法直接预览，请点击原文链接↑查看';
                    } else {
                        const $content = load($(contentSelector.content).html());
                        $content('a').each(function () {
                            const a = $(this);
                            const href = a.attr('href');
                            if (href && !href.startsWith('http')) {
                                a.attr('href', new URL(href, host).href);
                            }
                        });
                        item.description = $content.html();
                    }
                    const preDate = $(contentSelector.date).text().replaceAll(/年|月/g, '-').replaceAll('日', '');
                    item.pubDate = timezone(parseDate(preDate), +8);
                }
                return item;
            })
        )
    );

    return out;
}

export { getNoticeList };
