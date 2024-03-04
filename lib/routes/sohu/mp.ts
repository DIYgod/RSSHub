// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import * as path from 'node:path';
import { art } from '@/utils/render';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const authorArticleAPI = `https://v2.sohu.com/author-page-api/author-articles/pc/${id}`;

    const response = await got(authorArticleAPI);
    const list = response.data.data.pcArticleVOS.map((item) => ({
        title: item.title,
        link: item.link.startsWith('http') ? item.link : `https://${item.link}`,
        pubDate: parseDate(item.publicTime),
    }));
    let author, link;

    const items = await Promise.all(
        list.map((e) =>
            cache.tryGet(e.link, async () => {
                const { data: response } = await got(e.link);
                const $ = load(response);

                if (!author) {
                    const meta = $('span[data-role="original-link"]');
                    author = meta.find('a').text();
                    // can't get author's link on server, so use the RSSHub link
                    // link = meta.attr('href').split('==')[0];
                }

                if (/window\.sohu_mp\.article_video/.test($('script').text())) {
                    const videoSrc = $('script')
                        .text()
                        .match(/\s*url: "(.*?)",/)?.[1];
                    e.description = art(path.join(__dirname, 'templates/video.art'), {
                        poster: $('script')
                            .text()
                            .match(/cover: "(.*?)",/)?.[1],
                        src: videoSrc,
                        type: videoSrc?.split('.').pop().toLowerCase(),
                    });
                } else {
                    const article = $('#mp-editor');

                    article.find('#backsohucom, p[data-role="editor-name"]').each((i, e) => {
                        $(e).remove();
                    });

                    e.description = article.html();
                }

                e.author = author;

                return e;
            })
        )
    );

    ctx.set('data', {
        title: `搜狐号 - ${author}`,
        link,
        item: items,
    });
};
