import { renderToString } from 'hono/jsx/dom/server';

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
    renderToString(
        videoInfo.mobileUrl ? (
            <video controls poster={videoInfo.bigPosterUrl} preload="metadata">
                <source src={videoInfo.mobileUrl} type="video/mp4" />
            </video>
        ) : null
    );

export { extractDoc, renderVideo };
