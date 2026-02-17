import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.javlibrary.com';
const defaultMode = '1';
const defaultGenre = 'amjq';
const defaultMaker = 'arlq';
const defaultLanguage = 'ja';
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
const ProcessItems = async (language, currentUrl, tryGet) => {
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('.toolbar, .info, .videoinfo').remove();

    let items = $('.videotextlist, #video_comments')
        .find('a')
        .toArray()
        .filter((i) => $(i).parent().hasClass('video') || $(i).parent().get(0).tagName === 'strong')
        .map((item) => {
            item = $(item);

            const table = item.parentsUntil('table');
            const link = `${rootUrl}/${language}/${item.attr('href').replace(/^\.\//, '')}`;

            return {
                link, // url to target content.
                url: link.replace(/video.*\.php/, ''), // url to the video page.

                title: item.text(),
                description: table.find('textarea').text(),
                pubDate: parseDate(table.find('.date').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            tryGet(item.url, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.url,
                });

                const content = load(detailResponse.data);

                content('.icn_edit, .btn_videoplayer, a[rel="bookmark"]').remove();
                content('span').each(function () {
                    if (content(this).attr('class')?.startsWith('icn_')) {
                        content(this).remove();
                    }
                });

                item.author = content('.star')
                    .toArray()
                    .map((star) => content(star).text())
                    .filter((star) => star !== '')
                    .join(',');
                item.category = content('a[rel]')
                    .toArray()
                    .map((tag) => content(tag).text())
                    .filter((tag) => tag !== '');
                item.description = renderDescription({
                    cover: content('#video_jacket_img').attr('src'),
                    info: content('#video_info').html().replaceAll('span><span', 'span>,&nbsp;<span'),
                    comment: item.description?.replaceAll('[img]', '<img src="')?.replaceAll('[/img]', '"/>'),
                    thumbs: content('.previewthumbs img')
                        .toArray()
                        .map((img) => content(img).attr('src').replaceAll('-', 'jp-')),
                    videos: [...new Set(detailResponse.data.match(/(http[^"[\]]+\.mp4)/g))],
                });
                item.pubDate = item.pubDate.toString() === 'Invalid Date' ? parseDate(content('#video_date').find('.text').text()) : item.pubDate;

                delete item.url;

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
};

export { defaultGenre, defaultLanguage, defaultMaker, defaultMode, ProcessItems, rootUrl };
