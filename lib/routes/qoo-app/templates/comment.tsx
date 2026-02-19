import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type CommentData = {
    rating?: string | number;
    text?: string;
};

export const renderComment = ({ rating, text }: CommentData) =>
    renderToString(
        <>
            {rating}/5.0
            <br />
            {text ? raw(text) : null}
        </>
    );
