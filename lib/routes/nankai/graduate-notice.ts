import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/graduate/:type?',
    categories: ['university'],
    example: '/nankai/graduate/zxdt',
    parameters: { type: '栏目编号（若为空则默认为"zxdt"）' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['graduate.nankai.edu.cn', 'graduate.nankai.edu.cn/:type/list.htm'],
            target: '/graduate/:type?',
        },
    ],
    name: '研究生院',
    maintainers: ['ladeng07'],
    description: `| 最新动态 | 综合信息 | 招生工作 | 培养管理 | 国际交流 | 学科建设 | 学位管理 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| zxdt     | 82       | 83       | 72       | 73       | xkjs     | xwgl     |`,
    url: 'graduate.nankai.edu.cn',
    handler: async (ctx) => {
        // Read the notice category from the route path.
        const { type = 'zxdt' } = ctx.req.param();
        const baseUrl = 'https://graduate.nankai.edu.cn';
        const { data: response } = await got(`${baseUrl}/${type}/list.htm`);
        const $ = load(response);

        // Map the category identifier to its name.
        const categoryMap = {
            zxdt: '最新动态',
            '82': '综合信息',
            '83': '招生工作',
            '72': '培养管理',
            '73': '国际交流',
            xkjs: '学科建设',
            xwgl: '学位管理',
        };

        const categoryName = categoryMap[type] || '最新动态';

        // Parse the notice list.
        const list = $('.newslist li')
            .not('#wp_paging_w6 li')
            .toArray()
            .map((li) => {
                const $li = $(li);
                const $titleDiv = $li.find('.title');
                const $link = $titleDiv.find('a');
                const $timeDiv = $li.find('.time');

                const title = $link.attr('title');
                const href = $link.attr('href');
                const link = href ? new URL(href, `${baseUrl}/${type}/list.htm`).href : undefined;

                // Extract the publication date.
                const dateStr = $timeDiv.text().trim();
                const pubDate = dateStr ? timezone(parseDate(dateStr, 'YYYY-MM-DD'), 8) : undefined;

                return {
                    title: title!,
                    link,
                    pubDate,
                    author: '研究生院',
                    description: '', // Initialize the description.
                };
            })
            .filter((item) => item && item.link && item.title); // Discard entries without a link.

        // Fetch the article details.
        const items = await pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(`nankai:graduate:article:v3:${item.link}`, async () => {
                    const { data: response } = await got(item.link);
                    const $ = load(response);

                    // Support the available article layouts.
                    const $description = $('.wp_articlecontent').length ? $('.wp_articlecontent') : $('#txt, #js_content').first();

                    if ($description.length > 0) {
                        // Replace the PDF player with a download link.
                        $description.find('.wp_pdf_player').each((i, el) => {
                            const $el = $(el);
                            const pdfSrc = $el.attr('pdfsrc');
                            const sudyfileAttr = ($el.attr('sudyfile-attr') || '{}').replaceAll("'", '"');
                            const sudyfileAttrJson = JSON.parse(sudyfileAttr);
                            const fileName = sudyfileAttrJson.title || '未命名文件.pdf';
                            if (!pdfSrc) {
                                return;
                            }

                            let pdfUrl = pdfSrc;
                            if (!pdfUrl.startsWith('http')) {
                                pdfUrl = `${baseUrl}${pdfUrl}`;
                            }
                            // Replace the player with the download link.
                            $el.replaceWith(`<p><a href="${pdfUrl}" target="_blank">📄 ${fileName}</a></p>`);
                        });
                    }

                    if (!$description.length) {
                        throw new Error(`Could not find the graduate notice content: ${item.link}`);
                    }
                    return { description: $description.html() };
                });
                return { ...item, ...detail };
            },
            { concurrency: 3 }
        );

        return {
            // Feed title.
            title: `南开大学研究生院-${categoryName}`,
            // Feed link.
            link: `${baseUrl}/${type}/list.htm`,
            // Feed items.
            item: items,
        };
    },
};
