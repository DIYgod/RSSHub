import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    thumb?: string;
    description?: string;
    videoUrl?: string;
    videoPoster?: string;
};

const OeeeeDescription = ({ thumb, description, videoUrl, videoPoster }: DescriptionData) => (
    <>
        {videoUrl ? (
            <video controls poster={videoPoster}>
                <source src={videoUrl} type="video/mp4" />
            </video>
        ) : null}
        {thumb ? (
            <>
                <img src={thumb} />
                <br />
            </>
        ) : null}
        {description ? (
            <>
                <blockquote>
                    <p>{description}</p>
                </blockquote>
                <br />
            </>
        ) : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<OeeeeDescription {...data} />);
