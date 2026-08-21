import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src: string;
    alt?: string;
};

type DescriptionProps = {
    description?: string;
    images?: DescriptionImage[];
};

const Description = ({ description, images }: DescriptionProps) => (
    <>
        {description ? raw(description) : null}
        {images?.map((image, index) => (
            <figure key={`${image.src}-${index}`}>
                <img src={image.src} alt={image.alt} />
            </figure>
        ))}
    </>
);

export const renderDescription = (props: DescriptionProps): string => renderToString(<Description {...props} />);
