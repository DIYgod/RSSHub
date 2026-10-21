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

type QuotedRecord = {
    $type?: string;
    uri?: string;
    author?: {
        handle: string;
        displayName?: string;
    };
    value?: {
        text?: string;
    };
    embeds?: Embed[];
    record?: QuotedRecord;
};

type Embed = {
    $type?: string;
    images?: ImageEmbed[];
    external?: ExternalEmbed;
    record?: QuotedRecord;
    media?: Embed;
} & VideoEmbed;

type PostProps = {
    text?: string;
    embed?: Embed;
};

export const renderPost = ({ text, embed }: PostProps): string =>
    renderToString(
        <>
            {text
                ? text.split('\n').map((line) => (
                      <>
                          {line}
                          <br />
                      </>
                  ))
                : null}
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
                    ) : embed.$type === 'app.bsky.embed.record#view' ? (
                        renderQuotedRecord(embed.record)
                    ) : embed.$type === 'app.bsky.embed.recordWithMedia#view' ? (
                        <>
                            {raw(renderPost({ embed: embed.media }))}
                            {renderQuotedRecord(embed.record?.record)}
                        </>
                    ) : null}
                </>
            ) : null}
        </>
    );

function renderQuotedRecord(record?: QuotedRecord) {
    if (record?.$type !== 'app.bsky.embed.record#viewRecord' || !record.uri?.includes('/app.bsky.feed.post/') || !record.author?.handle || typeof record.value?.text !== 'string') {
        return null;
    }

    const link = `https://bsky.app/profile/${record.author.handle}/post/${record.uri.split('/').pop()}`;
    return (
        <blockquote>
            <a href={link}>{record.author.displayName || record.author.handle}</a>
            <br />
            {raw(renderPost({ text: record.value.text }))}
            {record.embeds?.map((embed) => raw(renderPost({ embed })))}
        </blockquote>
    );
}
