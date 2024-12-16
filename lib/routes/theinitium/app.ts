import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load, type CheerioAPI, type Element } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';
import { getCurrentPath } from '@/utils/helpers';

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

const resolveRelativeLink = ($: CheerioAPI, elem: Element, attr: string, baseUrl?: string) => {
    // code from @/middleware/paratmeter.ts
    const $elem = $(elem);

    if (baseUrl) {
        try {
            const oldAttr = $elem.attr(attr);
            if (oldAttr) {
                // e.g. <video><source src="https://example.com"></video> should leave <video> unchanged
                $elem.attr(attr, new URL(oldAttr, baseUrl).href);
            }
        } catch {
            // no-empty
        }
    }
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'latest_sc';
    const __dirname = getCurrentPath(import.meta.url);
    const baseUrl = 'https://app.theinitium.com/';

    const feeds = await cache.tryGet(
        new URL('timelines.json', baseUrl).href,
        async () =>
            await got({
                method: 'get',
                url: new URL('timelines.json', baseUrl).href,
            }),
        config.cache.routeExpire,
        false
    );

    const metadata = feeds.data.timelines.find((timeline) => timeline.id === category);

    const response = await got({
        method: 'get',
        url: new URL(metadata.feed, baseUrl).href,
    });

    const feed = response.data.stories.filter((item) => item.type === 'article');

    const items = await Promise.all(
        feed.map((item) =>
            cache.tryGet(new URL(item.url, baseUrl).href, async () => {
                item.link = item.shareurl ?? new URL(item.url, baseUrl).href;
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
                const response = await got(new URL(item.url, baseUrl).href);
                const $ = load(response.data);
                // resolve relative links with app.theinitium.com
                // code from @/middleware/paratmeter.ts
                $('a, area').each((_, elem) => {
                    resolveRelativeLink($, elem, 'href', baseUrl);
                    // $(elem).attr('rel', 'noreferrer');  // currently no such a need
                });
                // https://www.w3schools.com/tags/att_src.asp
                $('img, video, audio, source, iframe, embed, track').each((_, elem) => {
                    resolveRelativeLink($, elem, 'src', baseUrl);
                    $(elem).removeAttr('srcset');
                });
                $('video[poster]').each((_, elem) => {
                    resolveRelativeLink($, elem, 'poster', baseUrl);
                });
                const article = $('.pp-article__body');
                article.find('.block-related-articles').remove();
                article.find('figure.wp-block-pullquote').children().unwrap();
                article.find('div.block-explanation-note').wrapInner('<blockquote></blockquote>');
                article.find('div.wp-block-tcc-author-note').wrapInner('<em></em>').after('<hr>');
                article.find('p.has-small-font-size').wrapInner('<small></small>');
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    standfirst: $('.pp-header-group__standfirst').html(),
                    coverImage: $('.pp-media__image').attr('src'),
                    coverCaption: $('.pp-media__caption').html(),
                    article: article.html(),
                    copyright: $('.copyright').html(),
                });
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
