import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import type { JSX } from 'hono/jsx/jsx-runtime';

type DescriptionData = {
    image?: {
        src: string;
        alt?: string;
    };
    enclosure?: {
        src?: string;
        type?: string;
    };
    description?: string;
};

const AbcDescription = ({ image, enclosure, description }: DescriptionData) => {
    const enclosureTag = enclosure?.type?.split('/')[0] as keyof JSX.IntrinsicElements | undefined;

    return (
        <>
            {image ? (
                <figure>
                    <img src={image.src} alt={image.alt} />
                    <figcaption>{image.alt}</figcaption>
                </figure>
            ) : null}
            {enclosure && enclosureTag ? (
                <>
                    {(() => {
                        const EnclosureTag = enclosureTag;
                        return (
                            <EnclosureTag controls>
                                <source src={enclosure.src} type={enclosure.type} />
                                <object data={enclosure.src}>
                                    <embed src={enclosure.src} />
                                </object>
                            </EnclosureTag>
                        );
                    })()}
                </>
            ) : null}
            {description ? raw(description) : null}
        </>
    );
};

export const renderDescription = (data: DescriptionData) => renderToString(<AbcDescription {...data} />);
