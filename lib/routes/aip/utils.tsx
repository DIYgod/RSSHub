import { renderToString } from 'hono/jsx/dom/server';

const playwrightGet = async (url, context) => {
    const page = await context.newPage();
    // await page.setExtraHTTPHeaders({ referer: host });
    await page.route('**/*', (route) => {
        const request = route.request();
        request.resourceType() === 'document' ? route.continue() : route.abort();
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });
    const html = await page.evaluate(() => document.documentElement.getHTML());
    return html;
};

const renderDesc = (title, authors, doi, img) =>
    renderToString(
        <>
            <p>
                <span>
                    <big>{title}</big>
                </span>
                <br />
            </p>
            <p>
                <span>
                    <small>
                        <i>{authors}</i>
                    </small>
                </span>
                <br />
                <span>
                    <small>
                        <i>https://doi.org/{doi}</i>
                    </small>
                </span>
                <br />
                {img ? <img src={img} /> : null}
            </p>
        </>
    );

export { playwrightGet, renderDesc };
