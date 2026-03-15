import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionProps = {
    heading?: string;
    subItems?: Array<{ description?: string }>;
    articleContent?: string;
};

const Description = ({ heading, subItems, articleContent }: DescriptionProps) => (
    <>
        {heading ? <h1>{heading}</h1> : null}
        {subItems ? <>{subItems.map((item, index) => (item?.description ? <span key={`sub-${index}`}>{raw(item.description)}</span> : null))}</> : <>{articleContent ? raw(articleContent) : null}</>}
    </>
);

export const renderDescription = (props: DescriptionProps): string => renderToString(<Description {...props} />);
