import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DiscordMessageData = {
    message: any;
    guildInfo: any;
};

const renderWithLineBreaks = (text?: string) => (text ? raw(text.replaceAll('\n', '<br>')) : null);

const DiscordMessage = ({ message, guildInfo }: DiscordMessageData) => (
    <>
        {message.type === 7 ? (
            <>
                {message.author.global_name ?? message.author.username} joined {guildInfo.name}.<br />
            </>
        ) : null}
        {message.content ? (
            <>
                {renderWithLineBreaks(message.content)}
                <br />
            </>
        ) : null}
        {message.attachments?.map((attachment) => (
            <>
                <img src={attachment.proxy_url} />
                <br />
            </>
        ))}
        {message.sticker_items?.map((sticker) => {
            const src = sticker.format_type < 3 ? `https://cdn.discordapp.com/stickers/${sticker.id}.png` : sticker.format_type === 4 ? `https://media.discordapp.net/stickers/${sticker.id}.gif` : null;

            return src ? (
                <>
                    <img src={src} alt={sticker.name} />
                    <br />
                </>
            ) : null;
        })}
        {message.embeds?.map((embed) => (
            <>
                {embed.type === 'article' ? (
                    <>
                        {embed.url ? (
                            <>
                                <a href={embed.url}>{embed.title || embed.url}</a>
                                {embed.description ? (
                                    <>
                                        <br />
                                        {renderWithLineBreaks(embed.description)}
                                    </>
                                ) : null}
                                <br />
                            </>
                        ) : null}
                        {embed.thumbnail ? <img src={embed.thumbnail.proxy_url} /> : null}
                    </>
                ) : null}
                {embed.type === 'gifv' ? (
                    <video controls poster={embed.thumbnail?.proxy_url}>
                        <source src={embed.video?.proxy_url} type="video/mp4" />
                    </video>
                ) : null}
                {embed.type === 'image' ? <img src={embed.thumbnail?.proxy_url} /> : null}
                {embed.type === 'rich' ? (
                    <>
                        {embed.author ? (
                            <>
                                <a href={embed.author.url}>{embed.author.name}</a>
                                <br />
                            </>
                        ) : null}
                        <a href={embed.url}>{embed.title || embed.url}</a>
                        {embed.description ? (
                            <>
                                <br />
                                {renderWithLineBreaks(embed.description)}
                            </>
                        ) : null}
                        <br />
                        {embed.image ? <img src={embed.image.proxy_url} /> : null}
                    </>
                ) : null}
                {embed.type === 'video' ? (
                    <>
                        {embed.url ? (
                            <>
                                <a href={embed.url}>{embed.title}</a>
                                {embed.description ? (
                                    <>
                                        <br />
                                        {renderWithLineBreaks(embed.description)}
                                    </>
                                ) : null}
                                <br />
                            </>
                        ) : null}
                        {embed.thumbnail ? <img src={embed.thumbnail.proxy_url} /> : null}
                    </>
                ) : null}
                <br />
            </>
        ))}
    </>
);

export const renderDescription = (data: DiscordMessageData) => renderToString(<DiscordMessage {...data} />);
