import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const BASE_URL = 'http://yz.neu.edu.cn';
const DOWNLOAD_ID = 5792;
const MASTER1_ID = 5932;
const MASTER2_ID = 5933;
const PhD1_ID = 5945;
const PhD2_ID = 5946;
const DOWNLOAD_AUTHOR = '研招办';

const idMp = {
    download: DOWNLOAD_ID,
    master1: MASTER1_ID,
    master2: MASTER2_ID,
    phd1: PhD1_ID,
    phd2: PhD2_ID,
};

const parsePage = async (items, type) => {
    const results = await Promise.all(
        items.map(async (item) => {
            const $ = load(item);
            const aTag = $('span.Article_Title > a');
            const title = aTag.attr('title') ?? '';
            const url = BASE_URL + aTag.attr('href');
            const resultItem: DataItem = {
                title,
                link: url,
                description: '',
                pubDate: (() => {
                    const sTag = $('span.Article_PublishDate');
                    const pubDate = sTag.text() ? timezone(parseDate(sTag.text()), +8) : undefined;
                    return pubDate;
                })(),
                author: type === DOWNLOAD_ID ? DOWNLOAD_AUTHOR : '',
            };
            if (type === DOWNLOAD_ID && /\.(pdf|docx?|xlsx?|zip|rar|7z)$/i.test(url)) {
                resultItem.description = `
                        <p>${title}</p><br/>
                        <a href="${url}">点击进入下载地址传送门～</a>
                    `;
                return resultItem;
            } else {
                return await cache.tryGet(url, async () => {
                    const result = await got(url);
                    const $ = load(result.data);
                    const description = cleanEntryContent($);
                    resultItem.description = description;
                    if (type !== DOWNLOAD_ID) {
                        const dateText = $('.arti_update')
                            .text()
                            .match(/(\d{4}-\d{2}-\d{2})/);
                        const date = dateText ? dateText[1] : '';
                        const authorText = $('.arti_publisher')
                            .text()
                            .match(/[:：]?\s*(.+)/);
                        const author = authorText ? authorText[1].trim() : '';
                        resultItem.pubDate = timezone(parseDate(date), +8);
                        resultItem.author = author;
                    }
                    return resultItem;
                });
            }
        })
    );
    return results;
};

const handler = async (ctx) => {
    let type = ctx.req.param('type');
    if (idMp[type]) {
        type = idMp[type];
    }
    const newsUrl = `${BASE_URL}/${type}/list.htm`;
    const response = await got(newsUrl);
    const data = response.data;
    const $ = load(data);
    const title = $('title').text();
    const items = $('div.col_news_list ul.wp_article_list li').toArray();
    const results = await parsePage(items, type);
    return {
        title: `${title}-东北大学研究生招生信息网`,
        description: title,
        link: BASE_URL,
        item: results,
    };
};

const cleanEntryContent = ($) => {
    const entry = $('.entry');
    if (!entry || entry.length === 0) {
        return '';
    }
    entry.find('span').removeAttr('style').removeAttr('class');
    entry.find('div').each((_, el) => {
        const html = $(el).html();
        $(el).replaceWith(html);
    });
    entry.find('p').removeAttr('style').removeAttr('class');
    entry.find('a').removeAttr('style').removeAttr('class');
    entry.find('td').removeAttr('bgcolor');
    entry.find('img').each((_, el) => {
        const src = $(el).attr('src');
        const alt = $(el).attr('alt') || '';
        $(el).replaceWith(`<img src="${src}" alt="${alt}" />`);
    });
    entry.find('.wp_pdf_player').each((_, el) => {
        const url = BASE_URL + $(el).attr('pdfsrc');
        $(el).replaceWith(
            `
            <p>点击进入文件传送门～：<a href="${url}">查看文件</a></p>
            `
        );
    });
    entry.find('.wp_video_player').each((_, el) => {
        const div = $(el);
        const src = div.attr('sudy-wp-src');
        if (src) {
            const videoUrl = BASE_URL + src;
            const widthMatch = div.attr('style')?.match(/width:\s*(\d+)px/);
            const width = widthMatch && widthMatch[1] ? widthMatch[1] : '600';
            const heightMatch = div.attr('style')?.match(/height:\s*(\d+)px/);
            const height = heightMatch && heightMatch[1] ? heightMatch[1] : '400';
            const videoTag = `
                <video controls width="${width}" height="${height}" style="max-width: 100%;margin-left: auto;margin-right: auto;">
                    <source src="${videoUrl}" type="video/mp4">
                    您的浏览器不支持 video 标签。
                </video>
            `;
            div.replaceWith(videoTag);
        }
    });
    return entry.html();
};

export const route: Route = {
    path: '/yz/:type',
    categories: ['university'],
    example: '/neu/yz/master1',
    parameters: { type: '分类id,见下表' },
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
            source: ['yz.neu.edu.cn/:type/list.htm'],
            target: '/yz/:type',
        },
    ],
    name: '研究生招生信息网',
    url: 'yz.neu.edu.cn',
    maintainers: ['paintstar'],
    handler,
    description: `
| 分类名                     | 分类id      |
| ------------------------- | ---------- |
| 硕士公告                   | master1     |
| 硕士简章                   | master2     |
| 博士公告                   | phd1        |
| 博士简章                   | phd2        |
| 下载中心                   | download    |`,
};
