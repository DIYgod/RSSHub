import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src?: string;
    alt?: string;
};

type DescriptionProps = {
    images?: DescriptionImage[];
    description?: string;
};

const Description = ({ images, description }: DescriptionProps) => (
    <>
        {images?.map((image, index) =>
            image?.src ? (
                <figure key={`${image.src}-${index}`}>
                    <img src={image.src} alt={image.alt} />
                </figure>
            ) : null
        )}
        {description ? <>{raw(description)}</> : null}
    </>
);

export const renderDescription = (props: DescriptionProps): string => renderToString(<Description {...props} />);
