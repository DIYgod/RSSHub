import { renderToString } from 'hono/jsx/dom/server';

type YoutubeProps = {
    video: string;
};

const YoutubeEmbed = ({ video }: YoutubeProps) => (
    <iframe id="ytplayer" type="text/html" width="640" height="360" src={`https://www.youtube-nocookie.com/embed/${video}`} frameborder="0" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
);

export const renderYouTube = (props: YoutubeProps): string => renderToString(<YoutubeEmbed {...props} />);
