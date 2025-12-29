import { renderToString } from 'hono/jsx/dom/server';

type EmbedData = {
    img?: string;
    duration?: string;
    videoList?: string[];
};

export const renderEmbed = ({ img, duration, videoList = [] }: EmbedData): string =>
    renderToString(
        <video controls preload="metadata" referrerpolicy="no-referrer" style="width:50%" poster={img} duration={duration}>
            {videoList.map((source) => (
                <source referrerpolicy="no-referrer" src={source} />
            ))}
        </video>
    );
