import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    cover?: string;
    category?: string[];
    introduction?: string;
    images?: string[];
};

export const renderDescription = ({ cover, category = [], introduction, images = [] }: DescriptionData): string =>
    renderToString(
        <>
            {cover ? <img src={cover} /> : null}
            <p>
                {category.map((item) => (
                    <code>{item}</code>
                ))}
            </p>
            <p>{introduction}</p>
            {images.map((image) => (
                <img src={image} />
            ))}
        </>
    );
