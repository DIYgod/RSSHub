import { load } from 'cheerio';
import type { AnyNode } from 'domhandler';
import pMap from 'p-map';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const parseArticleDate = (value: string | undefined) => {
    if (!value) {
        return;
    }
    const date = parseDate(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}+08:00`);
    return Number.isNaN(date.getTime()) ? undefined : date;
};

// 加载文章页
const loadContent = async (link) => {
    const response = await got.get(link);
    const $ = load(response.data);
    // The visible time is the modification date, not the publication date.
    const pubDate = parseArticleDate($('meta[property="bytedance:published_time"]').attr('content'));
    const updated = parseArticleDate($('meta[property="bytedance:updated_time"]').attr('content'));
    // 去除样式
    $('.image-container, .image-container-fill').removeAttr('style');
    // 处理视频
    $('.video-package').each((index, elem) => {
        const $item = $(elem);
        const desc = $item.find('.video-description').html();
        const url = $item.attr('data-video-url');

        $item.html(`
            <p>${desc}</p>
            <iframe frameborder="0" src="${url}" allowFullScreen="true"></iframe>
        `);
    });
    // 提取内容
    const description = $('article').html();

    return { description, pubDate, updated };
};

const processFeed = (list: AnyNode[], caches) => {
    const host = 'https://www.jianshu.com';

    return pMap(
        list,
        async (item) => {
            const $ = load(item);
            const $title = $('.title');
            // 还原相对链接为绝对链接
            const itemUrl = new URL($title.attr('href')!, host).href;
            // Cache article content separately from the current list metadata.
            const other = await caches.tryGet(itemUrl, () => loadContent(itemUrl));
            return {
                ...other,
                title: $title.text(),
                link: itemUrl,
                author: $('.nickname').text(),
            };
        },
        { concurrency: 3 }
    );
};

export default { ProcessFeed: processFeed };
