const { art } = require('@/utils/render');
const { join } = require('path');

const extractDoc = (data) =>
    data
        .map((item) => {
            const type = item.type;
            if (type === 'video') {
                return renderVideo(item.data);
            }
            if (type === 'text') {
                return item.data.replace(/data-lazyload=(.+?) src=(.+?) style=".+?"/g, 'src=$1');
            }
            return '';
        })
        .join('<br>');

const renderVideo = (videoInfo) =>
    art(join(__dirname, 'templates/video.art'), {
        videoInfo,
    });

module.exports = {
    extractDoc,
    renderVideo,
};
