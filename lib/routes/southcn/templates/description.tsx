import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    thumb?: string;
    description?: string;
    videoUrl?: string;
};

const SouthcnDescription = ({ thumb, description, videoUrl }: DescriptionData) => (
    <>
        {videoUrl ? <video controls src={videoUrl} poster={thumb} /> : thumb ? <img src={thumb} /> : null}
        {description ? (
            <blockquote>
                <p>{description}</p>
            </blockquote>
        ) : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<SouthcnDescription {...data} />);
