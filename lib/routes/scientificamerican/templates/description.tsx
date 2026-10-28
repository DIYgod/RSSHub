import { raw } from 'hono/html';
import { jsx } from 'hono/jsx';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src?: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
};

type ContentBlock = {
    tag: string | null;
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
            return (
                <figure>
                    <img src={image.src} alt={image.alt} />
                </figure>
            );
        })}
        {intro ? raw(intro) : null}
        {content?.map((block) => (block.tag ? jsx(block.tag, null, raw(block.content)) : raw(block.content)))}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<ScientificAmericanDescription {...data} />);
