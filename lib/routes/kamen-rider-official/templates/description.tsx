import { renderToString } from 'hono/jsx/dom';

type DescriptionImage = {
    src?: string;
    alt?: string;
};

export const renderDescription = (image?: DescriptionImage): string =>
    renderToString(
        <>
            {image?.src ? (
                <figure>
                    <img src={image.src} alt={image.alt ?? undefined} />
                </figure>
            ) : null}
        </>
    );
