import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import * as path from 'node:path';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/mp/:id',
    categories: ['new-media'],
    example: '/sohu/mp/119097',
    parameters: { id: '搜狐号 ID' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '更新',
    maintainers: ['HenryQW'],
    handler,
    description: `1.  通过浏览器搜索相关搜狐号 \`果壳 site: mp.sohu.com\`。
  2.  通过浏览器控制台执行 \`contentData.mkey\`，返回的即为搜狐号 ID。`,
};

async function handler(ctx) {
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

    return {
        title: `搜狐号 - ${author}`,
        link,
        item: items,
    };
}
