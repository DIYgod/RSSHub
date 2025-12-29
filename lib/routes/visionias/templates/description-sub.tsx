import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionSubProps = {
    heading?: string;
    articleContent?: string;
};

const DescriptionSub = ({ heading, articleContent }: DescriptionSubProps) => (
    <>
        {heading ? <h2>{heading}</h2> : null}
        {articleContent ? raw(articleContent) : null}
    </>
);

export const renderDescriptionSub = (props: DescriptionSubProps): string => renderToString(<DescriptionSub {...props} />);
