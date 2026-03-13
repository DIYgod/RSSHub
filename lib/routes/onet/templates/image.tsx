import { renderToString } from 'hono/jsx/dom/server';

type ImageProps = {
    url?: string;
    alt?: string;
    caption?: string;
    author?: string;
};

const ImageFigure = ({ url, alt, caption, author }: ImageProps) => (
    <figure>
        <img src={url} alt={alt} />
        <figcation>
            {caption ? (
                <>
                    <cite>{caption}</cite> -{' '}
                </>
            ) : null}
            {author}
        </figcation>
    </figure>
);

export const renderImage = (props: ImageProps): string => renderToString(<ImageFigure {...props} />);
