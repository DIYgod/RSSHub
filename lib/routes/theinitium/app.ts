import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load, type CheerioAPI } from 'cheerio';
import type { Element } from 'domhandler';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';

const appUrl = 'https://app.theinitium.com/';
const userAgent = 'PugpigBolt v4.1.8 (iPhone, iOS 18.2.1) on phone (model iPhone15,2)';

export const route: Route = {
    path: '/app/:category?',
    categories: ['new-media', 'popular'],
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
    description: `抓取[The Initium App](https://app.theinitium.com/)的文章列表

::: warning
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

const resolveRelativeLink = ($: CheerioAPI, elem: Element, attr: string, appUrl?: string) => {
    // code from @/middleware/paratmeter.ts
    const $elem = $(elem);

    if (appUrl) {
        try {
            const oldAttr = $elem.attr(attr);
            if (oldAttr) {
                // e.g. <video><source src="https://example.com"></video> should leave <video> unchanged
                $elem.attr(attr, new URL(oldAttr, appUrl).href);
            }
        } catch {
            // no-empty
        }
    }
};

async function getUA(url: string) {
    return await got({
        method: 'get',
        url,
        headers: {
            'User-Agent': userAgent,
        },
    });
}

async function fetchAppPage(url: URL) {
    const response = await getUA(url.href);
    const $ = load(response.data);
    // resolve relative links with app.theinitium.com
    // code from @/middleware/paratmeter.ts
    $('a, area').each((_, elem) => {
        resolveRelativeLink($, elem, 'href', appUrl);
        // $(elem).attr('rel', 'noreferrer');  // currently no such a need
    });
    // https://www.w3schools.com/tags/att_src.asp
    $('img, video, audio, source, iframe, embed, track').each((_, elem) => {
        resolveRelativeLink($, elem, 'src', appUrl);
        $(elem).removeAttr('srcset');
    });
    $('video[poster]').each((_, elem) => {
        resolveRelativeLink($, elem, 'poster', appUrl);
    });
    const article = $('.pp-article__body');
    article.find('.block-related-articles').remove();
    article.find('figure.wp-block-pullquote').children().unwrap();
    article.find('div.block-explanation-note').wrapInner('<blockquote></blockquote>');
    article.find('div.wp-block-tcc-author-note').wrapInner('<em></em>').after('<hr>');
    article.find('p.has-small-font-size').wrapInner('<small></small>');
    return art(path.join(__dirname, 'templates/description.art'), {
        standfirst: $('.pp-header-group__standfirst').html(),
        coverImage: $('.pp-media__image').attr('src'),
        coverCaption: $('.pp-media__caption').html(),
        article: article.html(),
        copyright: $('.copyright').html(),
    });
}

async function fetchWebPage(url: URL) {
    const response = await got(url.href);
    const $ = load(response.data);
    const article = $('.entry-content');
    article.find('.block-related-articles').remove();
    article.find('figure.wp-block-pullquote').children().unwrap();
    article.find('div.block-explanation-note').wrapInner('<blockquote></blockquote>');
    article.find('div.wp-block-tcc-author-note').wrapInner('<em></em>').after('<hr>');
    article.find('p.has-small-font-size').wrapInner('<small></small>');
    return art(path.join(__dirname, 'templates/description.art'), {
        standfirst: $('span.caption1').html(),
        coverImage: $('.wp-post-image').attr('src'),
        coverCaption: $('.image-caption').html(),
        article: article.html(),
        copyright: $('.entry-copyright').html(),
    });
}

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'latest_sc';

    const feeds = await cache.tryGet(new URL('timelines.json', appUrl).href, async () => await getUA(new URL('timelines.json', appUrl).href), config.cache.routeExpire, false);
    const metadata = feeds.data.timelines.find((timeline) => timeline.id === category);
    const response = await getUA(new URL(metadata.feed, appUrl).href);
    const feed = response.data.stories.filter((item) => item.type === 'article');

    const items = await Promise.all(
        feed.map((item) =>
            cache.tryGet(item.shareurl, async () => {
                const url = new URL(item.shareurl);
                item.link = url.href;
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
                switch (url.hostname) {
                    case 'app.theinitium.com':
                        item.description = await fetchAppPage(url);
                        break;
                    case 'theinitium.com':
                        item.description = await fetchWebPage(url);
                        break;
                    default:
                        break;
                }
                return item;
            })
        )
    );

    let lang = 'zh-hans';
    let name = '端传媒';
    if (metadata.timeline_sets[0] === 'chinese-traditional') {
        lang = 'zh-hant';
        name = '端傳媒';
    }

    return {
        title: `${name} - ${metadata.title}`,
        link: `https://app.theinitium.com/t/latest/${category}/`,
        language: lang,
        item: items,
    };
}
