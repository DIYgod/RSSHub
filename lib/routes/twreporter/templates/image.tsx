import { renderToString } from 'hono/jsx/dom/server';

type ImageProps = {
    image: string;
    description?: string;
    caption?: string;
};

const ImageBlock = ({ image, description, caption }: ImageProps) => (
    <figure>
        <img src={image} alt={description} />
        <figcaption>{caption}</figcaption>
    </figure>
);

export const renderImage = (props: ImageProps): string => renderToString(<ImageBlock {...props} />);
