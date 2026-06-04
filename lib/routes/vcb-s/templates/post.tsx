import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type Media = {
    media_details?: {
        width?: string | number;
        height?: string | number;
    };
    source_url?: string;
};

type DescriptionData = {
    medias?: Media[];
    post?: string;
};

const VcbPostDescription = ({ medias, post }: DescriptionData) => (
    <>
        {medias?.map((media) => (
            <figure class="thumbnail">
                <img width={media.media_details?.width} height={media.media_details?.height} src={media.source_url} />
            </figure>
        ))}
        {post ? raw(post) : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<VcbPostDescription {...data} />);
