import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src?: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
};

type ContentBlock = {
    tag: string;
    content: string;
};

type DescriptionData = {
    images?: DescriptionImage[];
    intro?: string;
    content?: ContentBlock[];
};

const ScientificAmericanDescription = ({ images, intro, content }: DescriptionData) => (
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
        {intro ? raw(intro) : null}
        {content?.map((block) => {
            const Tag = block.tag as keyof JSX.IntrinsicElements;
            return <Tag>{raw(block.content)}</Tag>;
        })}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<ScientificAmericanDescription {...data} />);
