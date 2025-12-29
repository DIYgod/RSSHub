import { renderToString } from 'hono/jsx/dom/server';
import { raw } from 'hono/utils/html';

type DescriptionImage = {
    src?: string;
    alt?: string;
};

type DescriptionData = {
    images?: DescriptionImage[];
    description?: string;
};

const CbndataDescription = ({ images, description }: DescriptionData) => (
    <>
        {images?.map((image) =>
            image?.src ? (
                <figure>
                    <img src={image.src} alt={image.alt} />
                </figure>
            ) : null
        )}
        {description ? raw(description) : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<CbndataDescription {...data} />);
