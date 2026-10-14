import { renderToString } from 'hono/jsx/dom/server';

import { parseRelativeDate } from '@/utils/parse-date';

const renderDescription = (data): string =>
    renderToString(
        <>
            {data.previewVideo ? (
                <video controls preload="metadata" poster={data.poster}>
                    <source src={data.previewVideo} type="video/mp4" />
                </video>
            ) : data.poster ? (
                <img src={data.poster} />
            ) : null}
        </>
    );

export const parseItems = (e, baseUrl: string) => {
    const thumbnail = e.find('.video-card__thumbnail');
    const date = e
        .find('.video-card__meta')
        .text()
        .match(/\d+\s+(?:seconds?|minutes?|hours?|days?|weeks?|months?|years?) ago/i)?.[0];
    const poster = thumbnail.find('img').attr('data-front-lazy-src') || thumbnail.find('img').attr('src');
    const previewVideo = thumbnail.attr('data-front-video-preview-src');

    return {
        title: e.find('.video-card__title').text(),
        link: new URL(e.find('.video-card__title').attr('href')!, baseUrl).href,
        description: renderDescription({
            poster: poster ? new URL(poster, baseUrl).href : undefined,
            previewVideo: previewVideo ? new URL(previewVideo, baseUrl).href : undefined,
        }),
        pubDate: date ? parseRelativeDate(date) : undefined,
    };
};
