import { renderToString } from 'hono/jsx/dom/server';
import { raw } from 'hono/utils/html';

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
