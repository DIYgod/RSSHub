const got = require('@/utils/got');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

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

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'index';
    const cat = categories[category];
    const baseUrl = 'https://www2.hkej.com';

    dayjs.extend(utc);
    const yesterday = dayjs().utcOffset(8).subtract(1, 'day').format('YYYY-MM-DD');
    const today = dayjs().utcOffset(8).format('YYYY-MM-DD');

    const response = await got({
        method: 'get',
        url: baseUrl + cat.link,
        headers: {
            Referer: baseUrl,
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('h3.in_news_u_t a, h4.hkej_hl-news_topic_2014 a, div.hkej_toc_listingAll_news2_2014 h3 a, div.hkej_toc_cat_top_detail h3 a, div.allNews div.news h1 a, div#div_listingAll div.news2 h3 a')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text().trim(),
                link: baseUrl + item.attr('href').substring(0, item.attr('href').lastIndexOf('/')),
            };
        })
        .get();

    const items = await Promise.all(
        list &&
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const article = await got({
                        method: 'get',
                        url: item.link,
                        headers: {
                            Referer: cat.link,
                        },
                    });
                    const content = cheerio.load(article.data);

                    // remove unwanted elements
                    content('#ad_popup').remove();
                    content('[class^=ad-]').remove();
                    content('[id^=ad-]').remove();
                    content('[id^=div-gpt-ad-]').remove();
                    content('.hkej_sub_ex_article_nonsubscriber_ad_2014').remove();

                    // fix article image
                    content('div.hkej_detail_thumb_2014 a').each((_, e) => {
                        e = $(e);
                        if (e.attr('href')) {
                            content(e).after(`<figure><img src="${e.attr('href')}" alt="${e.attr('title')}" title="${e.attr('title')}"><figcaption>${e.attr('title')}</figcaption></figure>`);
                            content(e).remove();
                        }
                    });
                    const articleImg = content('.hkej_detail_thumb_2014 .enlargeImg').html() ?? '';

                    const pubDate = content('p.info span.date')
                        .text()
                        .trim()
                        .replace('日', '')
                        .replace('今', today)
                        .replace('昨', yesterday)
                        .replace(/[年月]/g, '-');

                    item.category = content('p.info span.cate a')
                        .toArray()
                        .map((e) => content(e).text().trim());
                    item.description = articleImg + content('div#article-content').html();
                    item.pubDate = timezone(parseDate(pubDate), +8);

                    return item;
                })
            )
    );

    ctx.state.data = {
        title: `信報網站 - ${cat.title} - 信報網站 hkej.com`,
        link: baseUrl + cat.link,
        description: `信報網站(www.hkej.com)即時新聞${cat.name}，提供${cat.description}。`,
        item: items,
        language: 'zh-hk',
    };
};
