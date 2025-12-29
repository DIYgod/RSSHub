import { renderToString } from 'hono/jsx/dom/server';

const courseDesc = (picurl, desc) =>
    renderToString(
        <>
            <img src={picurl} />
            <br />
            {desc}
        </>
    );

export default { courseDesc };
