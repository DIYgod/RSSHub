import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { art } from '@/utils/render';
import path from 'node:path';

const extractDoc = (data) =>
    data
        .map((item) => {
            const type = item.type;
            if (type === 'video') {
                return renderVideo(item.data);
            }
            if (type === 'text') {
                return item.data.replaceAll(/data-lazyload=(.+?) src=(.+?) style=".+?"/g, 'src=$1');
            }
            return '';
        })
        .join('<br>');

const renderVideo = (videoInfo) =>
    art(path.join(__dirname, 'templates/video.art'), {
        videoInfo,
    });

export { extractDoc, renderVideo };
