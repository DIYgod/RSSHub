import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type HeaderRenderOptions = {
    featuredImage?: {
        image?: {
            originalUrl?: string;
            title?: string;
            alt?: string;
        };
    };
    ledeMediaData?: {
        __typename?: string;
        embedHtml?: string;
        image?: {
            thumbnails?: {
                horizontal?: {
                    url?: string;
                };
            };
            title?: string;
            credit?: {
                plaintext?: string;
            };
        };
        video?: {
            volumeUuid?: string;
        };
    };
};

export const renderHeader = ({ featuredImage, ledeMediaData }: HeaderRenderOptions): string =>
    renderToString(
        <>
            {featuredImage?.image?.originalUrl ? (
                <figure>
                    <img src={featuredImage.image.originalUrl.split('?')[0]} alt={featuredImage.image.alt ?? undefined} />
                    <figcaption>{featuredImage.image.title}</figcaption>
                </figure>
            ) : null}

            {ledeMediaData ? (
                ledeMediaData.__typename === 'LedeMediaEmbedType' ? (
                    <>{ledeMediaData.embedHtml ? raw(ledeMediaData.embedHtml) : null}</>
                ) : ledeMediaData.__typename === 'LedeMediaImageType' && !featuredImage ? (
                    <figure>
                        <img src={ledeMediaData.image?.thumbnails?.horizontal?.url?.split('?')[0]} alt={ledeMediaData.image?.title ?? undefined} />
                        <figcaption>{ledeMediaData.image?.credit?.plaintext || ledeMediaData.image?.title}</figcaption>
                    </figure>
                ) : ledeMediaData.__typename === 'LedeMediaVideoType' ? (
                    <iframe src={`https://volume.vox-cdn.com/embed/${ledeMediaData.video?.volumeUuid}`} allowfullscreen></iframe>
                ) : null
            ) : null}
        </>
    );
