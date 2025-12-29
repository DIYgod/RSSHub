import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type ItemData = {
    iurl?: string;
    pdate?: string;
    dprice?: string;
    hcopy?: string[];
    text?: string;
};

export const renderEshopJpDescription = (item: ItemData) =>
    renderToString(
        <>
            <img src={`https://img-eshop.cdn.nintendo.net/i/${item.iurl}.jpg`} />
            <br />
            <strong>发售日期：</strong>
            {item.pdate}
            <br />
            <strong>价格：</strong>
            {item.dprice}円
            <br />
            <br />
            {item.hcopy
                ? item.hcopy.map((text) => (
                      <>
                          <b>{text}</b>
                          <br />
                      </>
                  ))
                : null}
            <br />
            {item.text ? <>{raw(item.text.replaceAll('\n', '<br>'))}</> : null}
        </>
    );
