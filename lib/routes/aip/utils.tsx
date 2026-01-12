import { renderToString } from 'hono/jsx/dom/server';

const puppeteerGet = async (url, browser) => {
    const page = await browser.newPage();
    // await page.setExtraHTTPHeaders({ referer: host });
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });
    const html = await page.evaluate(() => document.documentElement.innerHTML);
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

export { puppeteerGet, renderDesc };
