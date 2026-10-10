import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    src?: string;
    alt?: string;
    text?: string;
};

export const renderDescription = ({ src, alt, text }: DescriptionData): string =>
    renderToString(
        <>
            {src ? (
                <figure>
                    <img src={src} alt={alt} />
                </figure>
            ) : null}
            {text ? <div>{text}</div> : null}
        </>
    );
