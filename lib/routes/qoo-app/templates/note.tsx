import { renderToString } from 'hono/jsx/dom/server';

type NoteData = {
    content?: string;
    picture?: string;
};

export const renderNote = ({ content, picture }: NoteData) =>
    renderToString(
        <>
            {content}
            {picture ? (
                <>
                    <br />
                    <img src={picture} />
                </>
            ) : null}
        </>
    );
