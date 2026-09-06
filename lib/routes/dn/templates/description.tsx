import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    image?: {
        src: string;
        alt?: string;
    };
    abstracts?: string;
    description?: string;
};

const DnDescription = ({ image, abstracts, description }: DescriptionData) => (
    <>
        {image ? (
            <figure>
                <img src={image.src} alt={image.alt} />
            </figure>
        ) : null}
        {abstracts ? <backquote>{raw(abstracts)}</backquote> : null}
        {description ? raw(description) : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<DnDescription {...data} />);
