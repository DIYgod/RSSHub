import { load } from 'cheerio';
import type { Element } from 'domhandler';
import pMap from 'p-map';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { fixArticleContent } from '@/utils/wechat-mp';

const ProcessFeed = (list: Element[], cache, current) =>
    pMap(
        list.flatMap((item) => {
            const $ = load(item, null, false);
            const href = $('a').attr('href');
            return href ? [new URL(href, current.url).href] : [];
        }),
        ($url) =>
            cache.tryGet(`${$url}:content:v2`, async () => {
                const response = await got($url);

                const data = response.data;
                const $ = load(data);

                if (new URL($url).hostname === 'mp.weixin.qq.com') {
                    const timestamp = data.match(/\bct\s*=\s*["'](\d+)["']/)?.[1];
                    return {
                        title: $('meta[property="og:title"]').attr('content') || $('#activity-name').text(),
                        description: fixArticleContent($('#js_content')),
                        link: $url,
                        author: $('meta[name="author"]').attr('content') || $('#js_name').text(),
                        ...(timestamp && { pubDate: parseDate(timestamp, 'X') }),
                    };
                }

                // Remove publisher layout styling.
                $('img, div, span, p, table, td, tr, a').removeAttr('style');
                $('style').remove();

                const title = $('h2').text();

                const dateMatch = $('div.ny_fbt')
                    .text()
                    .match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);

                const single = {
                    title,
                    description: $(current.selector.content).html()! + ($('ul[style]').length ? $('ul[style]').html() : '')!,
                    link: $url,
                    pubDate: dateMatch ? timezone(parseDate(dateMatch[0], 'YYYY-MM-DD HH:mm'), 8) : undefined, // The source line combines publication time and view count.
                    author: '深圳大学研究生招生网',
                };
                return single;
            }),
        { concurrency: 3 }
    );

export default { ProcessFeed };
