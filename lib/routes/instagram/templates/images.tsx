import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type ImageItem = {
    url: string;
    height?: number | string;
    width?: number | string;
    alt?: string;
};

type ImagesRenderOptions = {
    summary?: string;
    images: ImageItem[];
};

export const renderImages = ({ summary, images }: ImagesRenderOptions): string =>
    renderToString(
        <>
            {summary ? (
                <>
                    {raw(summary.replaceAll('\n', '<br>'))}
                    <br />
                </>
            ) : null}
            {images.map((image) => (
                <img src={image.url} height={image.height} width={image.width} alt={image.alt ?? undefined} />
            ))}
        </>
    );
