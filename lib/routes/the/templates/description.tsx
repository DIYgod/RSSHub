import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src?: string;
    alt?: string;
    width?: string;
    height?: string;
};

type DescriptionData = {
    images?: DescriptionImage[];
    intro?: string;
    description?: string;
};

const resolveImageAlt = (image?: DescriptionImage) => image?.height ?? image?.width ?? image?.alt;

export const renderDescription = ({ images, intro, description }: DescriptionData) =>
    renderToString(
        <>
            {images?.length
                ? images.map((image) =>
                      image?.src ? (
                          <figure key={image.src}>
                              <img src={image.src} alt={resolveImageAlt(image)} />
                          </figure>
                      ) : null
                  )
                : null}
            {intro ? <blockquote>{intro}</blockquote> : null}
            {description ? <>{raw(description)}</> : null}
        </>
    );
