import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { art } from '@/utils/render';
import path from 'node:path';
import { parseRelativeDate } from '@/utils/parse-date';

const renderDescription = (data) => art(path.join(__dirname, 'templates/description.art'), data);

export const parseItems = (e) => ({
    title: e.find('a > img').attr('alt')!,
    link: e.find('a').attr('href')!,
    description: renderDescription({
        poster: e.find('a > img').data('src'),
        previewVideo: e.find('a > span').data('trailer'),
    }),
    pubDate: parseRelativeDate(e.find('.video-addtime').text()),
});
