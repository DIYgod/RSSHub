import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src?: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
};

type DescriptionData = {
    images?: DescriptionImage[];
    intro?: string;
    description?: string;
    original?: {
        name?: string;
        link?: string;
    };
};

const JinseDescription = ({ images, intro, description, original }: DescriptionData) => (
    <>
        {images?.map((image) => {
            if (!image?.src) {
                return null;
            }
            const altValue = image.height ?? image.width ?? image.alt;
            return (
                <figure>
                    <img src={image.src} alt={altValue ? String(altValue) : undefined} />
                </figure>
            );
        })}
        {intro ? <blockquote>{intro}</blockquote> : null}
        {description ? raw(description) : null}
        {original?.link ? (
            <p>
                {original.name}: <a href={original.link}>{original.link}</a>
            </p>
        ) : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<JinseDescription {...data} />);
