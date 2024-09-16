import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/app/:category?',
    categories: ['new-media'],
    example: '/theinitium/app',
    parameters: {
        category: 'Category, see below, latest_sc by default',
    },
    features: {
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'App',
    maintainers: ['quiniapiezoelectricity'],
    radar: [
        {
            source: ['app.theinitium.com/t/latest/:category'],
            target: '/app/:category',
        },
    ],
    handler,
    description: `
:::warning
此路由暂不支持登陆认证
:::

Category 栏目：

| ----- | 简体中文     | 繁體中文      |
| ----- | ----------------- | ---------------- |
| 最新   | latest_sc | latest_tc |
| 日报   | daily_brief_sc | daily_brief_tc |
| 速递   | whats_new_sc | whats_new_tc |
| 专题   | report_sc | report_tc |
| 评论   | opinion_sc | opinion_tc |
| 国际   | international_sc | international_tc |
| 大陆   | mainland_sc | mainland_tc |
| 香港   | hongkong_sc | hongkong_tc |
| 台湾   | taiwan_sc | taiwan_tc |
| 播客   | article_audio_sc | article_audio_tc |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'latest_sc';

    const feedList = await got({
        method: 'get',
        url: `https://app.theinitium.com/timelines.json`,
    });
    const feedInfo = feedList.data.timelines.find((timeline) => timeline.id === category);

    const link = `https://app.theinitium.com${feedInfo.feed.slice(1)}`;

    const feedResponse = await got({
        method: 'get',
        url: link,
    });

    const feed = feedResponse.data.stories.filter((item) => item.type === 'article');

    const items = await Promise.all(
        feed.map((item) =>
            cache.tryGet(item.shareurl, async () => {
                item.link = item.shareurl;
                item.description = item.summary;
                item.pubDate = item.published;
                item.category = [];
                if (item.section) {
                    item.category = [...item.category, item.section];
                }
                if (item.taxonomy) {
                    if (item.taxonomy.collection_tag) {
                        item.category = [...item.category, ...item.taxonomy.collection_tag];
                    }
                    if (item.taxonomy.sections) {
                        item.category = [...item.category, ...item.taxonomy.sections];
                    }
                }
                item.category = [...new Set(item.category)];
                const response = await got(item.shareurl);
                const $ = load(response.data);
                const article = $('.pp-article__body');
                article.find('.block-related-articles').remove();
                item.description = article.html();
                let cover;
                const coverImage = $('.pp-media__image').attr('src');
                if (coverImage) {
                    cover = `<img src=${coverImage}>`;
                }
                const coverCaption = $('.pp-media__caption').html();
                if (coverCaption) {
                    cover = cover + `<figcaption>${coverCaption}</figcaption>`;
                }
                if (cover) {
                    item.description = `<figure class>${cover}</figure>` + item.description;
                }
                const header = $('.pp-header-group__standfirst');
                if (header) {
                    item.description = `<h4>${header.html()}</h4>` + item.description;
                }
                const copyright = $('.copyright');
                if (copyright) {
                    item.description = item.description + `<figure><small>${copyright.html()}</small></figure>`;
                }
                return item;
            })
        )
    );

    let lang;
    let titleLoc;
    if (feedInfo.timeline_sets[0] === 'chinese-simplified') {
        lang = 'zh-hans';
        titleLoc = '端传媒';
    } else if (feedInfo.timeline_sets[0] === 'chinese-traditional') {
        lang = 'zh-hant';
        titleLoc = '端傳媒';
    } else {
        lang = 'zh-hans';
        titleLoc = '端传媒';
    }

    return {
        title: `${titleLoc} - ${feedInfo.title}`,
        link: `https://app.theinitium.com/t/latest/${category}/`,
        language: lang,
        item: items,
    };
}
