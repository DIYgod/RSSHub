import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/xwzx/:type?',
    categories: ['university'],
    example: '/guet/xwzx/xykx',
    parameters: { type: '资讯类型，如下表' },
    name: '新闻资讯',
    maintainers: ['cssxsh'],
    description: `| 桂电要闻 | 校园快讯 | 媒体桂电 | 通知公告 | 校内通知 | 学术信息 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| gdyw     | xykx     | mtgd     | tzgg     | xntz     | xsxx     |`,
    handler,
};

const host = 'https://www.guet.edu.cn';

const paths = {
    gdyw: 'gdyw_6356',
    xykx: 'xykx',
    mtgd: 'mtgd',
    tzgg: 'tzgg',
    xntz: 'xntz',
    xsxx: 'xsxx',
};

const externalContentSelectors: Record<string, string> = {
    'mp.weixin.qq.com': '#js_content',
    'www.stdaily.com': '.content',
    'app.gmdaily.cn': '.article-content',
    'gx.people.com.cn': '#rm_txt_zw',
    'guangxi.eol.cn': '.TRS_Editor',
};

async function getArticle(link: string, articleHost: string) {
    const result = await ofetch(link, { responseType: 'text' });
    const $ = load(result);
    if (articleHost === 'v.gltvs.com') {
        const movie = result.match(/playMovie\('([^']+\.mp4)',\s*'([^']*)'/);
        if (!movie) {
            throw new Error(`No public video found in ${link}`);
        }
        const video = $('<video controls></video>').attr('src', new URL(movie[1], 'https://video.gltvs.com').href);
        if (movie[2]) {
            video.attr('poster', new URL(movie[2], link).href);
        }
        return { description: $.html(video), pubDate: undefined };
    }
    const content = $(externalContentSelectors[articleHost] ?? '.wp_articlecontent');
    content.find('script, style').remove();
    content.find('img[data-src]').each((_, image) => {
        const element = $(image);
        element.attr('src', element.attr('data-src')!);
    });
    content.find('.wp_video_player[sudy-wp-src]').each((_, player) => {
        const element = $(player);
        const mediaUrl = new URL(element.attr('sudy-wp-src')!, link).href;
        const video = $('<video controls></video>').attr('src', mediaUrl);
        element.replaceWith(video);
    });
    const time =
        articleHost === new URL(host).hostname
            ? $('.arti_metas')
                  .text()
                  .match(/发布时间：\s*(\d+)年(\d+)月(\d+)日\s*(\d+)时(\d+)分/)
            : undefined;
    return {
        description: content.html(),
        pubDate: time ? timezone(parseDate(`${time[1]}-${time[2]}-${time[3]} ${time[4]}:${time[5]}`), 8) : undefined,
    };
}

async function handler(ctx: Context) {
    const { type = 'gdyw' } = ctx.req.param();
    if (!Object.hasOwn(paths, type)) {
        throw new InvalidParameterError('Invalid news type. Use gdyw, xykx, mtgd, tzgg, xntz, or xsxx.');
    }
    const path = paths[type];
    const url = `${host}/${path}/list.htm`;

    const response = await ofetch(url);
    const $ = load(response);

    const list = $('.news_list li.news')
        .toArray()
        .map((element) => {
            const $item = $(element);
            const a = $item.find('.news_title a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, host).href,
                description: $item.find('.news_text a').text(),
                pubDate: timezone(parseDate($item.find('.news_date').text(), 'YYYY-MM-DD'), 8),
            };
        });

    const item = await pMap(
        list,
        async (item) => {
            const articleHost = new URL(item.link).hostname;
            if (articleHost !== new URL(host).hostname && !Object.hasOwn(externalContentSelectors, articleHost) && articleHost !== 'v.gltvs.com') {
                return item;
            }
            const article = await cache.tryGet(`guet:article:${item.link}`, () => getArticle(item.link, articleHost));
            return { ...item, description: article.description ?? item.description, pubDate: article.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );

    return {
        title: $('.col_news_head h2').text(),
        link: url,
        item,
    };
}
