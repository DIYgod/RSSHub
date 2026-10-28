import { renderToString } from 'hono/jsx/dom/server';

import { parseDate } from '@/utils/parse-date';

const defaultDomain = 'https://www.pornhub.com';

const headers = {
    accessAgeDisclaimerPH: 1,
    hasVisited: 1,
};

const renderDescription = (data, showImages = false): string =>
    renderToString(
        <>
            {data.previewVideo ? (
                <video controls preload="metadata" poster={data.poster}>
                    <source src={data.previewVideo} type="video/webm" />
                </video>
            ) : null}
            {showImages && (data.thumbs ? data.thumbs.map((thumb, index) => <img key={`${thumb.src}-${index}`} src={thumb.src} />) : <img src={data.poster} />)}
        </>
    );
const extractDateFromImageUrl = (imageUrl) => {
    const matchResult = typeof imageUrl === 'string' ? imageUrl.match(/(\d{6})\/(\d{2})/) : undefined;
    return matchResult ? matchResult.slice(1, 3).join('') : undefined;
};

function getThumbnail(e): string | undefined {
    const image = e.find('img').first();
    const thumbnail = image.data('mediumthumb') || image.data('image');
    return typeof thumbnail === 'string' && thumbnail ? thumbnail : undefined;
}

function parsePublishDate(e): Date | undefined {
    const imageDate = extractDateFromImageUrl(e.find('img').data('mediumthumb'));
    const date = imageDate ? parseDate(imageDate, 'YYYYMMDD', true) : undefined;
    if (date && !Number.isNaN(date.getTime())) {
        return date;
    }
}

const parseItems = (e, showImages = false) => ({
    title: e.find('span.title a').text(),
    link: defaultDomain + e.find('span.title a').attr('href'),
    description: renderDescription(
        {
            poster: getThumbnail(e),
            previewVideo: e.find('img').data('mediabook'),
        },
        showImages
    ),
    author: e.find('.usernameWrap a').text(),
    pubDate: parsePublishDate(e),
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
