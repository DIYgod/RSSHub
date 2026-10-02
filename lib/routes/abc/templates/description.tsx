import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

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
    const mediaType = enclosure?.type?.split('/', 1)[0];
    const enclosureTag = mediaType === 'audio' || mediaType === 'video' ? mediaType : undefined;

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
