import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type OfferData = {
    img?: string;
    desc?: string;
};

const IkeaOffer = ({ img, desc }: OfferData) => (
    <>
        {img ? raw(img) : null}
        <br />
        {desc ? raw(desc) : null}
    </>
);

export const renderOffer = (data: OfferData) => renderToString(<IkeaOffer {...data} />);
