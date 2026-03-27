import { renderVideo } from './templates/video';

const baseUrl = 'https://pikabu.ru';

const fixImage = (element) => {
    element.find('.story-image__stretch').remove();
    element.find('.story-image__image').each((_, img) => {
        if (img.attribs['data-src'] && img.attribs['data-large-image']) {
            img.attribs.src = img.attribs['data-large-image'];
            delete img.attribs['data-src'];
            delete img.attribs['data-large-image'];
        }
    });
};

const fixVideo = (element) => {
    const preview = element
        .find('.player__preview')
        .attr('style')
        .match(/url\((.+)\);/)[1];
    const dataType = element.attr('data-type');
    let videoHtml: string;

    if (dataType === 'video') {
        const videoId = element.attr('data-source').match(/\/embed\/(.+)$/)[1];
        videoHtml = renderVideo({ videoId });
    } else if (dataType === 'video-file') {
        const width = element.find('.player__svg-stretch').attr('width');
        const mp4 = `${element.attr('data-source')}.mp4`;
        const webm = element.attr('data-webm');
        videoHtml = renderVideo({ preview, width, mp4, webm });
    } else {
        throw new Error(`Unknown video type: ${dataType}`);
    }
    element.replaceWith(videoHtml);
};

export { baseUrl, fixImage, fixVideo };
