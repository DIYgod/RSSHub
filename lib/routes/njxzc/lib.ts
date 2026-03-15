import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const url = 'https://lib.njxzc.edu.cn/pxyhd/list.htm';
const host = 'https://lib.njxzc.edu.cn';

export const route: Route = {
    path: '/libtzgg',
    categories: ['university'],
    example: '/njxzc/libtzgg',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['lib.njxzc.edu.cn/pxyhd/list.htm', 'lib.njxzc.edu.cn/'],
        },
    ],
    name: '图书馆通知公告',
    maintainers: ['real-jiakai'],
    handler,
    url: 'lib.njxzc.edu.cn/pxyhd/list.htm',
};

async function handler() {
    const response = await ofetch(url);
    if (!response) {
        return {
            title: '南京晓庄学院 -- 图书馆通知公告',
            link: url,
            item: [],
        };
    }
    const $ = load(response);

    const list = $('a.btt-2')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const href = $item.attr('href') || '';
            const link = href.startsWith('http') ? href : new URL(href, host).href;
            const day = $item.find('.tm-1').text().trim();
            const yearMonth = $item.find('.tm-2').text().trim();
            const dateStr = `${yearMonth}-${day}`;
            return {
                title: $item.find('.btt-4').text().trim(),
                link,
                pubDate: timezone(parseDate(dateStr, 'YYYY-MM-DD'), +8),
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
                    const $content = $('.wp_articlecontent');
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
                    const title = $('.arti_title').text().trim();
                    if (title) {
                        item.title = title;
                    }
                    const dateText = $('.arti_update').text().replace('发布时间：', '').trim();
                    if (dateText) {
                        item.pubDate = timezone(parseDate(dateText, 'YYYY-MM-DD'), +8);
                    }
                }

                return item;
            })
        )
    );

    return {
        title: '南京晓庄学院 -- 图书馆通知公告',
        link: url,
        item: out,
    };
}
