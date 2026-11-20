import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type PostingAttribute = {
    label?: string;
    value: string;
};

type DescriptionData = {
    images: string[];
    price?: string | number;
    location?: string;
    address?: string;
    attributes?: PostingAttribute[];
    body?: string | null;
};

const CraigslistDescription = ({ images, price, location, address, attributes, body }: DescriptionData) => (
    <>
        {images.map((src) => (
            <figure>
                <img src={src} />
            </figure>
        ))}
        {price ? (
            <p>
                <strong>Price:</strong> {price}
            </p>
        ) : null}
        {location ? (
            <p>
                <strong>Location:</strong> {location}
            </p>
        ) : null}
        {address ? (
            <p>
                <strong>Address:</strong> {address}
            </p>
        ) : null}
        {attributes?.length ? (
            <ul>
                {attributes.map((attribute) => (
                    <li>
                        {attribute.label ? <strong>{attribute.label}: </strong> : null}
                        {attribute.value}
                    </li>
                ))}
            </ul>
        ) : null}
        {body ? raw(body) : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<CraigslistDescription {...data} />);
