import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.javlibrary.com';
const defaultMode = '1';
const defaultGenre = 'amjq';
const defaultMaker = 'arlq';
const defaultLanguage = 'ja';
const parseSourceDate = (value: string) => {
    if (!value.trim()) {
        return;
    }
    const date = parseDate(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
};
const renderDescription = ({ cover, info, comment, videos, thumbs }) =>
    renderToString(
        <>
            <img src={cover} />
            {info ? <>{raw(info)}</> : null}
            {comment ? (
                <>
                    <br />
                    {raw(comment)}
                    <br />
                </>
            ) : null}
            {videos?.length
                ? videos.map((video) => (
                      <video controls>
                          <source src={video} type="video/mp4" />
                      </video>
                  ))
                : null}
            {thumbs?.length ? thumbs.map((thumb) => <img src={thumb} />) : null}
        </>
    );
const processItems = async (language, currentUrl) => {
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('.toolbar, .info, .videoinfo').remove();

    let items = $('.videotextlist, #video_comments')
        .find('a')
        .toArray()
        .filter((i) => $(i).parent().hasClass('video') || $(i).parent().get(0)!.tagName === 'strong')
        .map((item): DataItem & { url?: string } => {
            const $item = $(item);

            const table = $item.parentsUntil('table');
            const link = `${rootUrl}/${language}/${$item.attr('href')!.replace(/^\.\//, '')}`;

            return {
                link, // url to target content.
                url: link.replace(/video.*\.php/, ''), // url to the video page.

                title: $item.text(),
                description: table.find('textarea').text(),
                pubDate: parseSourceDate(table.find('.date').text()),
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`javlibrary:details:${item.url}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.url,
                });

                const content = load(detailResponse.data);

                content('.icn_edit, .btn_videoplayer, a[rel="bookmark"]').remove();
                content('span').each((_, el) => {
                    if (content(el).attr('class')?.startsWith('icn_')) {
                        content(el).remove();
                    }
                });

                return {
                    author: content('.star')
                        .toArray()
                        .map((star) => content(star).text())
                        .filter((star) => star !== '')
                        .join(','),
                    category: content('a[rel]')
                        .toArray()
                        .map((tag) => content(tag).text())
                        .filter((tag) => tag !== ''),
                    cover: content('#video_jacket_img').attr('src'),
                    info: content('#video_info').html()!.replaceAll('span><span', 'span>,&nbsp;<span'),
                    thumbs: content('.previewthumbs img')
                        .toArray()
                        .map((img) => content(img).attr('src')!.replaceAll('-', 'jp-')),
                    videos: [...new Set(detailResponse.data.match(/(http[^"[\]]+\.mp4)/g))],
                    pubDate: parseSourceDate(content('#video_date').find('.text').text()),
                };
            });
            const listItem: Omit<typeof item, 'url'> & { url?: string } = { ...item };
            delete listItem.url;
            return {
                ...listItem,
                author: detail.author,
                category: detail.category,
                description: renderDescription({
                    ...detail,
                    comment: item.description?.replaceAll('[img]', '<img src="')?.replaceAll('[/img]', '"/>'),
                }),
                pubDate: item.pubDate ?? detail.pubDate,
            };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};

export { defaultGenre, defaultLanguage, defaultMaker, defaultMode, processItems as ProcessItems, rootUrl };
