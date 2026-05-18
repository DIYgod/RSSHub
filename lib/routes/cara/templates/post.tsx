import { renderToString } from 'hono/jsx/dom/server';

type Image = {
    src: string;
};

type PostData = {
    content?: string;
    images?: Image[];
};

export const renderPost = ({ content, images = [] }: PostData): string =>
    renderToString(
        <>
            {content ? <p>{content}</p> : null}
            {images.map((image) => (
                <img src={image.src} />
            ))}
        </>
    );
