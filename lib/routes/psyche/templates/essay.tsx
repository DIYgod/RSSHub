import { raw } from 'hono/jsx';
import { renderToString } from 'hono/jsx/dom/server';

type EssayData = {
    banner?: string;
    authorsBio?: string;
    content?: string;
};

export const renderEssay = ({ banner, authorsBio, content }: EssayData) =>
    renderToString(
        <>
            <img src={banner} alt="" />
            {authorsBio ? raw(authorsBio) : null}
            {content ? raw(content) : null}
        </>
    );
