import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src?: string;
    alt?: string;
};

type DescriptionData = {
    images?: DescriptionImage[];
    description?: string;
};

export const renderDescription = ({ images, description }: DescriptionData) =>
    renderToString(
        <>
            {images?.length
                ? images.map((image) =>
                      image?.src ? (
                          <figure key={image.src}>
                              <img src={image.src} alt={image.alt} />
                          </figure>
                      ) : null
                  )
                : null}
            {description ? <>{raw(description)}</> : null}
        </>
    );
