import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.chinanews.com.cn';

function getPubDate(content: CheerioAPI) {
    const dateText = content('#pubtime_baidu').text() || content('.content_left_time, .source_time, .left p, div[style="text-align:right;font-size:12px;"], div.left-t').text();
    const date = dateText.match(/\d{4}[-年]\d{1,2}[-月]\d{1,2}日?\s+\d{1,2}:\d{2}(?::\d{2})?/)?.[0];
    if (!date) {
        return;
    }
    return timezone(parseDate(date.replaceAll(/[年月]/g, '-').replace('日', '')), 8);
}

function getAuthor(content: CheerioAPI) {
    const source = content('#source_baidu, a.source, .source_wrapper')
        .first()
        .text()
        .replace(/^来源\s*[:：]\s*/, '')
        .trim();
    if (source) {
        return source;
    }
    const info = content('.content_title .left p, .left-t, div[style="text-align:right;font-size:12px;"]').text();
    return info.match(/来源\s*[:：]\s*(\S+)/)?.[1];
}

export const route: Route = {
    path: '/',
    categories: ['traditional-media'],
    example: '/chinanews',
    radar: [
        {
            source: ['chinanews.com.cn/'],
            target: '',
        },
    ],
    name: '最新',
    maintainers: ['yuxinliu-alex'],
    handler,
    url: 'www.chinanews.com.cn/',
};

async function handler(ctx) {
    const language: Language = 'zh-CN';
    const currentUrl = `${rootUrl}/scroll-news/news1.html`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = load(response.data);
    const limit = getRouteLimit(ctx, 50);
    const list = $('a', '.dd_bt')
        .toArray()
        .map((item): DataItem => ({
            link: rootUrl + $(item).attr('href'),
            title: $(item).text(),
        }))
        .slice(0, limit);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);
                content('.adInContent, .content_editor').remove();
                if (content('div.content_desc').length > 0) {
                    item.description = content('div.content_desc').html();
                    const videoUrl = detailResponse.data.match(/\bsource\s*:\s*["'](https?:\/\/[^"']+\.mp4(?:\?[^"']*)?)["']/)?.[1];
                    if (videoUrl) {
                        const video = content('<video controls></video>').attr('src', videoUrl);
                        const poster = detailResponse.data.match(/addVariable\(["']vsimg["']\s*,\s*["']([^"']+)["']/)?.[1];
                        if (poster) {
                            video.attr('poster', poster);
                        }
                        item.description = video.toString() + (item.description ?? '');
                        item.enclosure_url = videoUrl;
                        item.enclosure_type = 'video/mp4';
                    }
                } else if (content('.current_img').length > 0) {
                    content('.current_img_desc_wrapper .editor').remove();
                    item.description = content('.current_img img').toString() + (content('.current_img_desc_wrapper .desc').html() ?? '');
                } else if (content('div.t3').length > 0) {
                    item.description = content('div.t3').html();
                } else {
                    item.description = content('div.left_zw').html();
                }
                item.author = getAuthor(content);
                item.pubDate = getPubDate(content);
                return item;
            })
        )
    );
    return {
        title: '中国新闻网',
        link: currentUrl,
        description: '中国新闻网（简称“中新网”），由中国新闻社主办，为中央重点新闻网站。',
        language,
        item: items,
    };
}
