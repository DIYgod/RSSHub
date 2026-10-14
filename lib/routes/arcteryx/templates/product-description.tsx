import { renderToString } from 'hono/jsx/dom/server';

type ProductItem = {
    shortDescription?: string;
    originalPrice?: string;
    price?: string;
    image?: string;
};

export const renderProductDescription = (item: ProductItem): string =>
    renderToString(
        <div>
            {item.shortDescription ? (
                <>
                    {item.shortDescription}
                    <br />
                </>
            ) : null}
            {item.originalPrice ? (
                <>
                    Original Price: {item.originalPrice}
                    <br />
                </>
            ) : null}
            {item.price ? (
                <>
                    Current Price: {item.price}
                    <br />
                </>
            ) : null}
            {item.image ? <img src={item.image} /> : null}
        </div>
    );
