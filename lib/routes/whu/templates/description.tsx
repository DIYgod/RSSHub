import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type ImageData = {
    src: string;
    alt?: string;
    width?: string | number;
};

type VideoData = {
    src: string;
    width?: string | number;
    height?: string | number;
};

type Attachment = {
    link: string;
    title: string;
};

type DescriptionData = {
    description?: string;
    image?: ImageData;
    video?: VideoData;
    attachments?: Attachment[];
};

export const renderDescription = ({ description, image, video, attachments }: DescriptionData): string =>
    renderToString(
        <>
            {description ? raw(description) : null}
            {image ? (
                <figure>
                    <img src={image.src} alt={image.alt} width={image.width} />
                </figure>
            ) : null}
            {video ? (
                <video controls width={video.width} height={video.height}>
                    <source src={video.src} type={`video/${video.src.split('.').pop()}`} />
                </video>
            ) : null}
            {attachments?.length ? (
                <>
                    <b>附件</b>
                    <ul>
                        {attachments.map((attachment) => (
                            <li>
                                <a href={attachment.link}>{attachment.title}</a>
                            </li>
                        ))}
                    </ul>
                </>
            ) : null}
        </>
    );
