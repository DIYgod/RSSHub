import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type ImageEmbed = {
    fullsize: string;
    alt?: string | null;
};

type ExternalEmbed = {
    uri: string;
    title?: string;
    description?: string;
};

type VideoEmbed = {
    thumbnail?: string;
    playlist?: string;
};

type Embed = {
    $type?: string;
    images?: ImageEmbed[];
    external?: ExternalEmbed;
} & VideoEmbed;

type PostProps = {
    text?: string;
    embed?: Embed;
};

export const renderPost = ({ text, embed }: PostProps): string =>
    renderToString(
        <>
            {text ? (
                <>
                    {raw(text)}
                    <br />
                </>
            ) : null}
            {embed ? (
                <>
                    {embed.$type === 'app.bsky.embed.images#view' ? (
                        embed.images?.map((image) => (
                            <span>
                                <img src={image.fullsize} alt={image.alt ?? ''} />
                                <br />
                            </span>
                        ))
                    ) : embed.$type === 'app.bsky.embed.video#view' ? (
                        <>
                            <video controls poster={embed.thumbnail} style="max-width: 100%; height: auto;" preload="metadata">
                                <source src={embed.playlist} type="application/x-mpegURL" />
                                Your browser does not support HTML5 video playback.
                            </video>
                            <br />
                        </>
                    ) : embed.$type === 'app.bsky.embed.external#view' ? (
                        <a href={embed.external?.uri}>
                            <b>{embed.external?.title}</b>
                            <br />
                            {embed.external?.description}
                        </a>
                    ) : null}
                </>
            ) : null}
        </>
    );
