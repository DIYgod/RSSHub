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

export const parseItems = (e) => ({
    title: e.find('a > img').attr('alt')!,
    link: e.find('a').attr('href')!,
    description: renderDescription({
        poster: e.find('a > img').data('src'),
        previewVideo: e.find('a > span').data('trailer'),
    }),
    pubDate: parseRelativeDate(e.find('.video-addtime').text()),
});
