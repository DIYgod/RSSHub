import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type MediaImage = {
    src?: string;
    width?: string | number;
    height?: string | number;
};

type MediaAudio = {
    src?: string;
    type?: string;
};

type MediaVideo = {
    src?: string;
    type?: string;
    poster?: string;
};

type DescriptionData = {
    image?: MediaImage;
    audio?: MediaAudio;
    video?: MediaVideo;
    preface?: string;
    summary?: string;
    description?: string;
};

export const renderDescription = ({ image, audio, video, preface, summary, description }: DescriptionData) =>
    renderToString(
        <>
            {!video?.src && image?.src ? (
                <figure>
                    <img src={image.src} width={image.width} height={image.height} />
                </figure>
            ) : null}
            {audio?.src ? (
                <audio controls>
                    <source src={audio.src} type={audio.type} />
                </audio>
            ) : null}
            {video?.src ? (
                <video poster={video.poster || image?.src} controls>
                    <source src={video.src} type={video.type} />
                    <object data={video.src}>
                        <embed src={video.src} />
                    </object>
                </video>
            ) : null}
            {preface ? <>{raw(preface)}</> : null}
            {summary ? <>{raw(summary)}</> : null}
            {description ? <>{raw(description)}</> : null}
        </>
    );
