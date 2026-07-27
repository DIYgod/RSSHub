import { load } from 'cheerio';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const ProcessFeed = (list, cache, current) =>
    Promise.all(
        list
            .filter((item) => {
                // 如果不包含链接说明不是新闻item，如表头的tr
                const $ = load(item, null, false);
                return $('a').length;

                // return typeof ($('a').attr('href')) !== undefined;
                // return false;
            })
            .map((item) => {
                let $ = load(item, null, false);
                const $url = new URL($('a').attr('href')!, current.url).href;
                return cache.tryGet($url, async () => {
                    // 加载新闻内容页面
                    const response = await got($url);

                    const data = response.data;
                    $ = load(data); // 使用 cheerio 加载返回的 HTML

                    // 去除样式
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
                        pubDate: dateMatch ? timezone(parseDate(dateMatch[0], 'YYYY-MM-DD HH:mm'), 8) : undefined, // 混有发表时间和点击量，取出时间
                        author: '深圳大学研究生招生网',
                    };
                    // 返回列表上提取到的信息
                    return single;
                });
            })
    );

export default { ProcessFeed };
