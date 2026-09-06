import { renderToString } from 'hono/jsx/dom/server';

type VideoData = {
    videoPoster?: string;
    videoSrcs?: string[];
};

const PicukiVideo = ({ videoPoster, videoSrcs }: VideoData) => (
    <video poster={videoPoster} controls>
        {videoSrcs?.map((src) => (
            <source src={src} type="video/mp4" />
        ))}
    </video>
);

export const renderVideo = (data: VideoData) => renderToString(<PicukiVideo {...data} />);
