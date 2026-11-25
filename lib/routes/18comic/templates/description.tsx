import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    cover?: string;
    category?: string[];
    introduction?: string;
    images?: string[];
};

export const renderDescription = ({ cover, introduction, images = [] }: DescriptionData): string =>
    renderToString(
        <>
            {cover ? <img src={cover} /> : null}
            <p>{introduction}</p>
            {images
                .filter((image) => image !== cover)
                .map((image) => (
                    <img src={image} />
                ))}
        </>
    );
