import { renderToString } from 'hono/jsx/dom/server';

type DescriptionItem = {
    title: string;
    authors: string;
    doi: string;
    issue: string;
    abstract: string;
};

export const renderDescription = (item: DescriptionItem): string =>
    renderToString(
        <>
            <p>
                <span>
                    <big>{item.title}</big>
                </span>
                <br />
            </p>
            <p>
                <span>
                    <small>
                        <i>{item.authors}</i>
                    </small>
                </span>
                <br />
                <span>
                    <small>
                        <i>{`https://doi.org/${item.doi}`}</i>
                    </small>
                </span>
                <br />
                <span>
                    <small>
                        <i>{item.issue}</i>
                    </small>
                </span>
                <br />
            </p>
            <p>
                <span>{item.abstract}</span>
                <br />
            </p>
        </>
    );
