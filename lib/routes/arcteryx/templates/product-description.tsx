import { renderToString } from 'hono/jsx/dom/server';

type ProductItem = {
    short_description?: string;
    original_price?: string;
    price?: string;
    image: string;
};

export const renderProductDescription = (item: ProductItem): string =>
    renderToString(
        <div>
            {item.short_description ? (
                <>
                    {item.short_description}
                    <br />
                </>
            ) : null}
            {item.original_price ? (
                <>
                    Original Price: {item.original_price}
                    <br />
                </>
            ) : null}
            {item.price ? (
                <>
                    Current Price: {item.price}
                    <br />
                </>
            ) : null}
            <img src={item.image} />
        </div>
    );
