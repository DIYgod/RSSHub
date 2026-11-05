import { renderToString } from 'hono/jsx/dom/server';

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

export { renderDesc };
