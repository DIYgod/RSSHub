import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionImage = {
    src?: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
};

type DescriptionMedia = {
    src?: string;
    type?: string;
};

type DescriptionProps = {
    images?: DescriptionImage[];
    audios?: DescriptionMedia[];
    videos?: DescriptionMedia[];
    intro?: string;
    description?: string;
};

const Description = ({ images, audios, videos, intro, description }: DescriptionProps) => (
    <>
        {images?.map((image, index) =>
            image?.src ? (
                <figure key={`${image.src}-${index}`}>
                    <img src={image.src} alt={image.alt} width={image.width} height={image.height} />
                </figure>
            ) : null
        )}
        {audios?.map((audio, index) =>
            audio?.src ? (
                <audio key={`${audio.src}-${index}`} controls>
                    <source src={audio.src} type={audio.type} />
                    <object data={audio.src}>
                        <embed src={audio.src} />
                    </object>
                </audio>
            ) : null
        )}
        {videos?.map((video, index) =>
            video?.src ? (
                video?.type?.endsWith('taptap') ? (
                    <iframe key={`${video.src}-${index}`} src={video.src} frameborder="0" allowfullscreen></iframe>
                ) : (
                    <video key={`${video.src}-${index}`} controls>
                        <source src={video.src} type={video.type} />
                        <object data={video.src}>
                            <embed src={video.src} />
                        </object>
                    </video>
                )
            ) : null
        )}
        {intro ? <blockquote>{intro}</blockquote> : null}
        {description ? <>{raw(description)}</> : null}
    </>
);

export const renderDescription = (props: DescriptionProps): string => renderToString(<Description {...props} />);
