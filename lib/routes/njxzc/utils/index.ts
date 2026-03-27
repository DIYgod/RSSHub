import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch'; // 使用默认导出的方式导入ofetch
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

async function getNoticeList(ctx, url, host, titleSelector, dateSelector, contentSelector, listSelector) {
    const response = await ofetch(url);
    if (!response) {
        return [];
    }
    const $ = load(response);

    const list = $(listSelector)
        .toArray()
        .map((item) => {
            item = $(item);
            const href = item.find(titleSelector).attr('href') || '';
            const link = href.startsWith('http') ? href : new URL(href, host).href;
            return {
                title: item.find(titleSelector).attr('title'),
                link,
                pubDate: timezone(parseDate(item.find(dateSelector).text(), 'YYYY-MM-DD'), +8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                if ($('.wp_error_msg').length > 0) {
                    item.description = '您当前ip并非校内地址，该信息仅允许校内地址访问';
                } else {
                    const $content = $(contentSelector.content);
                    // Convert wp_pdf_player iframes to download links
                    $content.find('.wp_pdf_player').each(function () {
                        const $iframe = $(this);
                        const pdfSrc = $iframe.attr('pdfsrc') || '';
                        const pdfUrl = pdfSrc.startsWith('http') ? pdfSrc : new URL(pdfSrc, host).href;
                        $iframe.replaceWith(`<p><a href="${pdfUrl}">附件下载</a></p>`);
                    });
                    // Fix relative URLs
                    $content.find('a').each(function () {
                        const $a = $(this);
                        const href = $a.attr('href');
                        if (href && !href.startsWith('http')) {
                            $a.attr('href', new URL(href, host).href);
                        }
                    });
                    item.description = $content.html() || '';
                    item.title = $(contentSelector.title).text();
                    const dateText = $(contentSelector.date).text().replace('编辑：', '').replace('发布日期：', '').replace('发布时间：', '');
                    item.pubDate = timezone(parseDate(dateText, 'YYYY-MM-DD'), +8);
                }

                return item;
            })
        )
    );

    return out;
}

export { getNoticeList };
