import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import parser from '@/utils/rss-parser';
import { load } from 'cheerio';

export const route: Route = {
    path: '/:hub?',
    categories: ['new-media', 'popular'],
    example: '/theverge',
    parameters: { hub: 'Hub, see below, All Posts by default' },
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
            source: ['theverge.com/:hub', 'theverge.com/'],
        },
    ],
    name: 'The Verge',
    maintainers: ['HenryQW', 'vbali'],
    handler,
    description: `| Hub         | Hub name            |
  | ----------- | ------------------- |
  |             | All Posts           |
  | android     | Android             |
  | apple       | Apple               |
  | apps        | Apps & Software     |
  | blackberry  | BlackBerry          |
  | culture     | Culture             |
  | gaming      | Gaming              |
  | hd          | HD & Home           |
  | microsoft   | Microsoft           |
  | photography | Photography & Video |
  | policy      | Policy & Law        |
  | web         | Web & Social        |

  Provides a better reading experience (full text articles) over the official one.`,
};

async function handler(ctx) {
    const link = ctx.req.param('hub') ? `https://www.theverge.com/${ctx.req.param('hub')}/rss/index.xml` : 'https://www.theverge.com/rss/index.xml';

    const feed = await parser.parseURL(link);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);

                const $ = load(response.data);

                const content = $('#content');
                const body = $('.duet--article--article-body-component-container');

                // 处理封面图片

                const cover = $('meta[property="og:image"]');

                if (cover.length > 0) {
                    $(`<img src=${cover[0].attribs.content}>`).insertBefore(body[0].childNodes[0]);
                }

                // 处理封面视频
                $('div.l-col__main > div.c-video-embed, div.c-entry-hero > div.c-video-embed').each((i, e) => {
                    const src = `https://volume.vox-cdn.com/embed/${e.attribs['data-volume-uuid']}?autoplay=false`;

                    $(`<iframe src="${src}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no"></iframe>`).insertBefore(body[0].childNodes[0]);
                });

                // 处理封面视频
                $('div.l-col__main > div.c-video-embed--media iframe').each((i, e) => {
                    $(e).insertBefore(body[0].childNodes[0]);
                });

                // 处理文章图片
                content.find('figure.e-image').each((i, e) => {
                    let src, caption;

                    // 处理 jpeg, png
                    if ($(e).find('picture > source').length > 0) {
                        src = $(e)
                            .find('picture > img')[0]
                            .attribs.srcset.match(/(?<=320w,).*?(?=520w)/g)[0]
                            .trim();
                    } else if ($(e).find('img.c-dynamic-image').length > 0) {
                        // 处理 gif
                        src = $(e).find('span.e-image__image')[0].attribs['data-original'];
                    }

                    // 处理 caption
                    if ($(e).find('span.e-image__meta').length > 0) {
                        caption = $(e).find('span.e-image__meta').text();
                    }

                    const figure = `<figure><img src=${src}>${caption ? `<br><figcaption>${caption}</figcaption>` : ''}</figure>`;

                    $(figure).insertBefore(e);

                    $(e).remove();
                });

                const lede = $('.duet--article--lede h2:first');
                if (lede[0]) {
                    lede.insertBefore(body[0].childNodes[0]);
                }

                // 移除无用 DOM
                content.find('.duet--article--comments-join-the-conversation').remove();
                content.find('.duet--recirculation--related-list').remove();
                delete item.content;
                delete item.contentSnippet;
                delete item.isoDate;

                item.description = body.html();

                return item;
            })
        )
    );

    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
    };
}
