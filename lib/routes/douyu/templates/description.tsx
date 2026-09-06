import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    url?: string;
    size?: {
        w?: number | string;
        h?: number | string;
    };
};

type DescriptionReply = {
    nickname?: string;
    time?: string;
    content?: string;
};

type DescriptionRenderOptions = {
    content?: string;
    images?: DescriptionImage[];
    replies?: DescriptionReply[];
};

export const renderDescription = ({ content, images, replies }: DescriptionRenderOptions): string =>
    renderToString(
        <>
            {content ? <>{content}</> : null}
            {images?.map((image) => (
                <img src={image.url} width={image.size?.w} height={image.size?.h} />
            ))}
            {replies?.length ? (
                <>
                    <h3>回复</h3>
                    {replies.map((reply) => (
                        <p>
                            <b>{reply.nickname}</b> <small>[{reply.time}]</small>: {reply.content}
                        </p>
                    ))}
                </>
            ) : null}
        </>
    );
