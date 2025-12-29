import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src?: string;
    alt?: string;
};

type DescriptionRenderOptions = {
    category?: string;
    catalogue?: string;
    title?: string;
    size?: string;
    date?: string;
    images?: DescriptionImage[];
};

export const renderDescription = ({ category, catalogue, title, size, date, images }: DescriptionRenderOptions): string =>
    renderToString(
        <>
            {category || catalogue || title || size || date ? (
                <table>
                    <tbody>
                        {category ? (
                            <tr>
                                <th>Category</th>
                                <td>{raw(category)}</td>
                            </tr>
                        ) : null}
                        {catalogue ? (
                            <tr>
                                <th>Catalogue</th>
                                <td>{raw(catalogue)}</td>
                            </tr>
                        ) : null}
                        {title ? (
                            <tr>
                                <th>Title</th>
                                <td>{raw(title)}</td>
                            </tr>
                        ) : null}
                        {size ? (
                            <tr>
                                <th>Size</th>
                                <td>{raw(size)}</td>
                            </tr>
                        ) : null}
                        {date ? (
                            <tr>
                                <th>Date</th>
                                <td>{raw(date)}</td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            ) : null}
            {images?.map((image) =>
                image?.src ? (
                    <figure>
                        <img src={image.src} alt={image.alt ?? undefined} />
                    </figure>
                ) : null
            )}
        </>
    );
