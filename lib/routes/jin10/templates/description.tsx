import { renderToString } from 'hono/jsx/dom/server';
import { raw } from 'hono/utils/html';

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
