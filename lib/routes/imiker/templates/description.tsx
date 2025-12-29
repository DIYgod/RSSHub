import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src?: string;
    alt?: string;
    width?: string;
    height?: string;
};

type DescriptionProps = {
    image?: DescriptionImage;
    headImage?: string;
    author?: string;
    question?: string;
    description?: string;
};

const Description = ({ image, headImage, author, question, description }: DescriptionProps) => {
    const imageAlt = image?.height ?? image?.width ?? image?.alt;

    return (
        <>
            {image?.src ? (
                <figure>
                    <img src={image.src} alt={imageAlt} />
                </figure>
            ) : null}
            {headImage ? (
                <figure>
                    <img src={headImage} />
                    {author ? <figcaption>{author}</figcaption> : null}
                </figure>
            ) : null}
            {question ? <blockquote>{question}</blockquote> : null}
            {description ? <>{raw(description)}</> : null}
        </>
    );
};

export const renderDescription = (props: DescriptionProps): string => renderToString(<Description {...props} />);
