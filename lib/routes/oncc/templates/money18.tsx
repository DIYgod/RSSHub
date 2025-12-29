import { renderToString } from 'hono/jsx/dom/server';
import { raw } from 'hono/utils/html';

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
