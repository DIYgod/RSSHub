import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src?: string;
    alt?: string;
};

type DescriptionVideo = {
    src?: string;
    poster?: string;
    type?: string;
};

type DescriptionProps = {
    images?: DescriptionImage[];
    videos?: DescriptionVideo[];
    intro?: string;
    description?: string;
};

const Description = ({ images, videos, intro, description }: DescriptionProps) => {
    const fallbackPoster = images?.[0]?.src;

    return (
        <>
            {images?.map((image, index) =>
                image?.src ? (
                    <figure key={`${image.src}-${index}`}>
                        <img src={image.src} alt={image.alt} />
                    </figure>
                ) : null
            )}
            {videos?.map((video, index) =>
                video?.src ? (
                    <video key={`${video.src}-${index}`} poster={video.poster ?? fallbackPoster} controls>
                        <source src={video.src} type={video.type} />
                        <object data={video.src}>
                            <embed src={video.src} />
                        </object>
                    </video>
                ) : null
            )}
            {intro ? <blockquote>{intro}</blockquote> : null}
            {description ? <>{raw(description)}</> : null}
        </>
    );
};

export const renderDescription = (props: DescriptionProps): string => renderToString(<Description {...props} />);
