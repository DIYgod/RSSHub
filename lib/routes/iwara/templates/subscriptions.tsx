import { renderToString } from 'hono/jsx/dom/server';

export const renderSubscriptionImages = (images: Array<string | undefined>) => {
    const filteredImages = images.filter(Boolean);

    return renderToString(
        <>
            {filteredImages.map((image) => (
                <>
                    <img src={image} />
                    <br />
                </>
            ))}
        </>
    );
};
