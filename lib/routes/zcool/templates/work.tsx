import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type ProductImage = {
    urlBig?: string;
    description?: string;
};

type WorkData = {
    description?: string;
    productImages?: ProductImage[];
};

const normalizeUrl = (url: string) => (url.includes('?x-oss-process') ? url.split('?')[0] : url);

export const renderWork = (data: WorkData): string =>
    renderToString(
        <>
            {data.description ? <>{raw(data.description)}</> : null}
            {data.productImages?.map((image) => (
                <>
                    {image.urlBig ? <img src={normalizeUrl(image.urlBig)} /> : null}
                    {image.description ? <>{raw(image.description)}</> : null}
                </>
            ))}
        </>
    );
