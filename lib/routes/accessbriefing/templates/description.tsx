import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type ImageData = {
    src?: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
};

type DescriptionData = {
    images?: ImageData[];
    intro?: string;
    description?: string;
};

const AccessBriefingDescription = ({ images, intro, description }: DescriptionData) => (
    <>
        {images?.length
            ? images.map((image) => {
                  if (!image?.src) {
                      return null;
                  }
                  const alt = image.height ?? image.width ?? image.alt;
                  return (
                      <figure>
                          <img alt={alt === undefined ? undefined : String(alt)} src={image.src} />
                      </figure>
                  );
              })
            : null}
        {intro ? <blockquote>{intro}</blockquote> : null}
        {description ? raw(description) : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<AccessBriefingDescription {...data} />);
