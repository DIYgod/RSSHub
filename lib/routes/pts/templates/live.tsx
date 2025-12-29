import { raw } from 'hono/jsx';
import { renderToString } from 'hono/jsx/dom/server';

type LiveData = {
    images: string[];
    texts: string[];
};

export const renderLive = ({ images, texts }: LiveData): string =>
    renderToString(
        <>
            {images.map((image) => (
                <img src={image} />
            ))}
            {texts.map((text) => (
                <>{raw(text)}</>
            ))}
        </>
    );
