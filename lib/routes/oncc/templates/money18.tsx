import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionProps = {
    images?: string[];
    description?: string;
};

const Description = ({ images, description }: DescriptionProps) => (
    <>
        {images?.map((image, index) => (
            <img key={`${image}-${index}`} src={image} />
        ))}
        {description ? <>{raw(description)}</> : null}
    </>
);

export const renderDescription = (props: DescriptionProps): string => renderToString(<Description {...props} />);
