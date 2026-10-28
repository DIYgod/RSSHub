import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

const courseDesc = (picurl, desc) =>
    renderToString(
        <>
            <img src={picurl} />
            <br />
            {raw(desc)}
        </>
    );

export default { courseDesc };
