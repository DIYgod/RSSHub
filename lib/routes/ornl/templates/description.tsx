import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src?: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
};

type DescriptionData = {
    images?: DescriptionImage[];
    intro?: string;
    description?: string;
};

const OrnlDescription = ({ images, intro, description }: DescriptionData) => (
    <>
        {images?.map((image) =>
            image?.src ? (
                <figure>
                    <img src={image.src} alt={image.alt} width={image.width} height={image.height} />
                </figure>
            ) : null
        )}
        {intro ? <blockquote>{intro}</blockquote> : null}
        {description ? raw(description) : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<OrnlDescription {...data} />);
