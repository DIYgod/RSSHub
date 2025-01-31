import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { art } from '@/utils/render';
import path from 'node:path';
import { CookieJar } from 'tough-cookie';

const cookieJar = new CookieJar();

const categories = {
    index: {
        name: '',
        link: '/instantnews/',
        title: '即時香港中國 國際金融 股市經濟新聞',
        description: '全天候即時港股、香港財經、國際金融和經濟新聞、中國經濟新聞資訊和分析',
    },
    stock: {
        name: '港股直擊',
        link: '/instantnews/stock',
        title: '即時香港股市 股份板塊 攻略分析',
        description: '全天候即時港股追蹤和直擊分析，股份異動、大行報告、沽空、速評',
    },
    hongkong: {
        name: '香港財經',
        link: '/instantnews/hongkong',
        title: '即時香港經濟 中港經濟融合追蹤分析',
        description: '香港經濟和焦點行業 中港融合和商機的分析',
    },
    china: {
        name: '中國財經',
        link: '/instantnews/china',
        title: '即時中國經濟 國策焦點 中港融合追蹤分析',
        description: '香港經濟和焦點行業 中港融合和商機的分析',
    },
    international: {
        name: '國際財經',
        link: '/instantnews/international',
        title: '即時國際財經 股市匯市 央行政策',
        description: '國際財經 金融股市 央行政策的新聞和分析',
    },
    property: {
        name: '地產新聞',
        link: '/property/news',
        title: '地產投資',
        description: '即時地產新聞, 新盤資訊, 樓市分析, 藍籌屋苑數據及室內設計鑑賞',
    },
    current: {
        name: '時事脈搏',
        link: '/instantnews/current',
        title: '即時香港中國 國際金融 股市經濟新聞',
        description: '全天候即時香港股市、金融、經濟新聞資訊和分析，致力與讀者一起剖釋香港、關注兩岸、放眼全球政經格局',
    },
};

export const route: Route = {
    path: '/:category?',
    categories: ['traditional-media'],
    example: '/hkej/index',
    parameters: { category: '分类，默认为全部新闻' },
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
            source: ['hkej.com/'],
        },
    ],
    name: '即时新闻',
    maintainers: ['TonyRL'],
    handler,
    url: 'hkej.com/',
    description: `| index    | stock    | hongkong | china    | international | property | current  |
| -------- | -------- | -------- | -------- | ------------- | -------- | -------- |
| 全部新闻 | 港股直击 | 香港财经 | 中国财经 | 国际财经      | 地产新闻 | 时事脉搏 |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'index';
    const cat = categories[category];
    const baseUrl = 'https://www2.hkej.com';

    const response = await got({
        method: 'get',
        url: baseUrl + cat.link,
        headers: {
            Referer: baseUrl,
        },
        cookieJar,
    });

    const $ = load(response.data);

    const list = $('h3.in_news_u_t a, h4.hkej_hl-news_topic_2014 a, div.hkej_toc_listingAll_news2_2014 h3 a, div.hkej_toc_cat_top_detail h3 a, div.allNews div.news h1 a, div#div_listingAll div.news2 h3 a')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text().trim(),
                link: baseUrl + item.attr('href').substring(0, item.attr('href').lastIndexOf('/')),
            };
        })
        .get();

    const renderArticleImg = (pics) =>
        art(path.join(__dirname, 'templates/articleImg.art'), {
            pics,
        });

    const renderDesc = (pics, desc) =>
        art(path.join(__dirname, 'templates/description.art'), {
            pics: renderArticleImg(pics),
            desc,
        });

    const items = await Promise.all(
        list &&
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const article = await got({
                        method: 'get',
                        url: item.link,
                        headers: {
                            Referer: cat.link,
                        },
                        cookieJar,
                    });
                    const content = load(article.data);

                    // remove unwanted elements
                    content('#ad_popup').remove();
                    content('[class^=ad-]').remove();
                    content('[id^=ad-]').remove();
                    content('[id^=div-gpt-ad-]').remove();
                    content('.hkej_sub_ex_article_nonsubscriber_ad_2014').remove();

                    // fix article image
                    const articleImg = (content('div.hkej_detail_thumb_2014 td a').length ? content('div.hkej_detail_thumb_2014 td a') : content('div.thumb td a'))
                        .map((_, e) => {
                            e = $(e);
                            return {
                                href: e.attr('href'),
                                title: e.attr('title'),
                            };
                        })
                        .get();

                    const pubDate = content('p.info span.date').text().trim();

                    item.category = content('p.info span.cate a')
                        .toArray()
                        .map((e) => content(e).text().trim());
                    item.description = renderDesc(articleImg, content('div#article-content').html());
                    item.pubDate = timezone(/(今|昨)/.test(pubDate) ? parseRelativeDate(pubDate) : parseDate(pubDate, 'YYYY M D'), +8);

                    return item;
                })
            )
    );

    const ret = {
        title: `信報網站 - ${cat.title} - 信報網站 hkej.com`,
        link: baseUrl + cat.link,
        description: `信報網站(www.hkej.com)即時新聞${cat.name}，提供${cat.description}。`,
        item: items,
        language: 'zh-hk',
    };

    ctx.set('json', {
        ...ret,
        cookieJar,
    });
    return ret;
}
