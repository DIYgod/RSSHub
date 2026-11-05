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
    question?: string;
    description?: string;
};

const Description = ({ image, question, description }: DescriptionProps) => (
    <>
        {image?.src ? (
            <figure>
                <img src={image.src} alt={image.alt} width={image.width} height={image.height} />
            </figure>
        ) : null}
        {question ? <blockquote>{question}</blockquote> : null}
        {description ? <>{raw(description)}</> : null}
    </>
);

export const renderDescription = (props: DescriptionProps): string => renderToString(<Description {...props} />);
