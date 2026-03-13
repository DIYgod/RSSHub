import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type LocationLink = {
    length: number;
    attr: (key: string) => string | undefined;
    text: () => string;
};

type PostData = {
    media?: string;
    desc?: string;
    locationLink?: LocationLink;
};

const PicukiPost = ({ media, desc, locationLink }: PostData) => (
    <>
        {media ? raw(media.replaceAll('\n', '')) : null}
        {desc ? <p>{raw(desc.replaceAll('\n', '<br>'))}</p> : null}
        {locationLink?.length ? (
            locationLink.attr('href') ? (
                <p>
                    📍{' '}
                    <small>
                        <a href={locationLink.attr('href')}>{locationLink.text()}</a>
                    </small>
                </p>
            ) : (
                <p>
                    📍 <small>{locationLink.text()}</small>
                </p>
            )
        ) : null}
    </>
);

export const renderPost = (data: PostData) => renderToString(<PicukiPost {...data} />);
