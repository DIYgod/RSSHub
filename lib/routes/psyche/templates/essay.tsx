import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type EssayData = {
    banner?: string;
    content?: string;
};

export const renderEssay = ({ banner, content }: EssayData) =>
    renderToString(
        <>
            <img src={banner} alt="" />
            {content ? raw(content) : null}
        </>
    );
