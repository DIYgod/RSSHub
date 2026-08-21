import { renderToString } from 'hono/jsx/dom/server';

type MediaProps = {
    youTube?: string;
    img?: string;
    video?: string;
};

const Media = ({ youTube, img, video }: MediaProps) => (
    <>
        {youTube ? (
            <iframe width="560" height="315" src={`https://www.youtube-nocookie.com/embed/${youTube}`} frameborder="0" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
        ) : img ? (
            <img src={img} />
        ) : video ? (
            <video src={video} controls></video>
        ) : null}
    </>
);

export const renderMedia = (props: MediaProps): string => renderToString(<Media {...props} />);
