import dayjs from 'dayjs';
import { renderToString } from 'hono/jsx/dom/server';

import { parseRelativeDate } from '@/utils/parse-date';

const defaultDomain = 'https://www.pornhub.com';

const headers = {
    accessAgeDisclaimerPH: 1,
    hasVisited: 1,
};

const renderDescription = (data): string =>
    renderToString(
        <>
            {data.previewVideo ? (
                <video controls preload="metadata" poster={data.poster}>
                    <source src={data.previewVideo} type="video/webm" />
                </video>
            ) : null}
            {data.thumbs?.map((thumb, index) => (
                <img key={`${thumb.src}-${index}`} src={thumb.src} />
            ))}
        </>
    );
const extractDateFromImageUrl = (imageUrl) => {
    const matchResult = imageUrl.match(/(\d{6})\/(\d{2})/);
    return matchResult ? matchResult.slice(1, 3).join('') : null;
};

const parseItems = (e) => ({
    title: e.find('span.title a').text().trim(),
    link: defaultDomain + e.find('span.title a').attr('href'),
    description: renderDescription({
        poster: e.find('img').data('mediumthumb'),
        previewVideo: e.find('img').data('mediabook'),
    }),
    author: e.find('.usernameWrap a').text(),
    pubDate: dayjs(extractDateFromImageUrl(e.find('img').data('mediumthumb'))).toDate() || parseRelativeDate(e.find('.added').text()),
});

const getRadarDomin = (path: string) => [
    {
        source: [`www.pornhub.com${path}`, `www.pornhub.com${path}/*`],
        target: path,
    },
    ...['de', 'fr', 'es', 'it', 'pt', 'pl', 'rt', 'jp', 'nl', 'cz', 'cn'].map((language) => ({
        source: [`${language}.pornhub.com${path}`, `${language}.pornhub.com${path}/*`],
        target: `${path}/${language}`,
    })),
];

export { defaultDomain, getRadarDomin, headers, parseItems, renderDescription };
