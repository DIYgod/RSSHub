import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

export const renderDescription = (content?: string, pic?: string) =>
    renderToString(
        <>
            {content ? <>{raw(content)}</> : null}
            {pic ? (
                <>
                    <br />
                    <img src={pic} />
                </>
            ) : null}
        </>
    );
