import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type Image = {
    src: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
};

type DescriptionProps = {
    images?: Image[];
    intro?: string;
    description?: string;
};

export const renderDescription = ({ images, intro, description }: DescriptionProps): string =>
    renderToString(
        <>
            {images?.length
                ? images.map((image) =>
                      image?.src ? (
                          <figure>
                              <img src={image.src} alt={image.alt} width={image.width} height={image.height} />
                          </figure>
                      ) : null
                  )
                : null}
            {intro ? <blockquote>{intro}</blockquote> : null}
            {description ? raw(description) : null}
        </>
    );
