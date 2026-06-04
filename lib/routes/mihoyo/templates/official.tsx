import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type CoverItem = {
    url?: string;
};

export const renderOfficialDescription = (hasCover: boolean, coverList: CoverItem[], content: string) =>
    renderToString(
        <>
            {hasCover
                ? coverList.map((cover) => (
                      <>
                          <img src={cover.url} />
                          <br />
                      </>
                  ))
                : null}
            {content ? <>{raw(content)}</> : null}
        </>
    );
