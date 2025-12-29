import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const toSize = (raw) => {
    const matches = raw.match(/(\d+(\.\d+)?)(\w+)/);
    return matches[3] === 'GB' ? matches[1] * 1024 : matches[1];
};

const renderDescription = ({ info, videoSrc, videoPreview, magnets, thumbs }) =>
    renderToString(
        <>
            {info ? raw(info) : null}
            <br />
            {videoSrc ? <a href={videoSrc}>觀看完整影片</a> : null}
            <br />
            {videoPreview ? (
                <video controls>
                    <source src={videoPreview} type="video/mp4" />
                </video>
            ) : null}
            <br />
            <h4>磁力連結投稿</h4>
            <table>
                <tr>
                    <th>磁力名稱</th>
                    <th>檔案大小</th>
                    <th>分享日期</th>
                </tr>
                {magnets?.map((magnet) => (
                    <tr>
                        <td>
                            <a href={magnet.link}>{magnet.title}</a>
                        </td>
                        <td>{magnet.size}</td>
                        <td>{magnet.date}</td>
                    </tr>
                ))}
            </table>
            <h4>樣品圖像</h4>
            {thumbs?.map((thumb) => (
                <img src={thumb} />
            ))}
        </>
    );

const allowDomain = new Set(['javbus.com', 'javbus.org', 'javsee.icu', 'javsee.one']);

export const route: Route = {
    path: '/:path{.+}?',
    radar: [
        {
            source: ['www.javbus.com/:path*'],
            target: '/:path',
        },
    ],
    name: 'Works',
    maintainers: ['MegrezZhu', 'CoderTonyChan', 'nczitzk', 'Felix2yu'],
    categories: ['multimedia'],
    view: ViewType.Videos,
    handler,
    url: 'www.javbus.com',
    example: '/javbus/star/rwt',
    parameters: {
        path: {
            description: 'Any path of list page on javbus',
        },
    },
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const isWestern = /^\/western/.test(getSubPath(ctx));
    const domain = ctx.req.query('domain') ?? 'javbus.com';
    const westernDomain = ctx.req.query('western_domain') ?? 'javbus.org';

    const rootUrl = `https://www.${domain}`;
    const westernUrl = `https://www.${westernDomain}`;

    if (!config.feature.allow_user_supply_unsafe_domain && (!allowDomain.has(new URL(`https://${domain}/`).hostname) || !allowDomain.has(new URL(`https://${westernDomain}/`).hostname))) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    const currentUrl = `${isWestern ? westernUrl : rootUrl}${getSubPath(ctx)
        .replace(/^\/western/, '')
        .replace(/\/home/, '')}`;

    const headers = {
        'accept-language': 'zh-CN',
    };

    const response = await got({
        method: 'get',
        url: currentUrl,
        headers,
    });

    const $ = load(response.data);

    let items = $('.movie-box')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: item.attr('href'),
                guid: item.find('date').first().text(),
                pubDate: parseDate(item.find('date').last().text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    headers,
                });

                const content = load(detailResponse.data);

                content('.genre').last().parent().remove();
                content('input[type="checkbox"], button').remove();

                const stars = content('.avatar-box span')
                    .toArray()
                    .map((s) => content(s).text());

                const cacheIn = {
                    author: stars.join(', '),
                    title: content('h3').text(),
                    category: [
                        ...content('.genre label')
                            .toArray()
                            .map((c) => content(c).text()),
                        ...stars,
                    ],
                    info: content('.row.movie').html(),
                    thumbs: content('.sample-box')
                        .toArray()
                        .map((i) => {
                            const thumbSrc = content(i).attr('href');
                            return thumbSrc.startsWith('http') ? thumbSrc : `${rootUrl}${thumbSrc}`;
                        }),
                };

                let magnets, videoSrc, videoPreview;

                // To fetch magnets.

                try {
                    const matches = detailResponse.data.match(/var gid = (\d+);[\S\s]*var uc = (\d+);[\S\s]*var img = '(.*)';/);

                    const magnetResponse = await got({
                        method: 'get',
                        url: `${rootUrl}/ajax/uncledatoolsbyajax.php`,
                        searchParams: {
                            gid: matches[1],
                            lang: 'zh',
                            img: matches[3],
                            uc: matches[2],
                            floor: 800,
                        },
                        headers: {
                            Referer: item.link,
                        },
                    });

                    const content = load(`<table>${magnetResponse.data}</table>`);

                    magnets = content('tr')
                        .toArray()
                        .map((tr) => {
                            const td = content(tr).find('a[href]');

                            return {
                                title: td.first().text().trim(),
                                link: td.first().attr('href'),
                                size: td.eq(1).text().trim(),
                                date: td.last().text().trim(),
                                score: content(tr).find('a').length ** 8 * toSize(td.eq(1).text().trim()),
                            };
                        });

                    if (magnets) {
                        item.enclosure_url = magnets.toSorted((a, b) => b.score - a.score)[0].link;
                        item.enclosure_type = 'application/x-bittorrent';
                    }
                } catch {
                    // no-empty
                }

                // If the video is not western, go fetch preview.

                if (!isWestern) {
                    try {
                        const avgleResponse = await got({
                            method: 'get',
                            url: `https://api.avgle.com/v1/jav/${item.guid}/0`,
                        });

                        // full video
                        videoSrc = avgleResponse.data.response.videos[0]?.embedded_url ?? '';
                        // video preview
                        videoPreview = avgleResponse.data.response.videos[0]?.preview_video_url ?? '';
                    } catch {
                        // no-empty
                    }
                }

                item.author = cacheIn.author;
                item.title = cacheIn.title;
                item.category = cacheIn.category;
                item.description = renderDescription({
                    info: cacheIn.info,
                    thumbs: cacheIn.thumbs,
                    magnets,
                    videoSrc,
                    videoPreview,
                });

                return item;
            })
        )
    );

    const title = $('head title').text();

    return {
        title: `${title.startsWith('JavBus') ? '' : 'JavBus - '}${title.replace(/ - AV磁力連結分享/, '')}`,
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
}
