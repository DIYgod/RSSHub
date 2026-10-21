import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    description?: string;
    projectUrl?: string;
    image?: {
        src?: string;
        title?: string;
    };
    assets?: Array<{
        asset_type?: string;
        player_embedded?: string;
        image_url?: string;
        title?: string;
        title_formatted?: string;
    }>;
};

const ArtstationDescription = ({ description, projectUrl, image, assets }: DescriptionData) => (
    <>
        {description ? (
            <>
                {raw(description)}
                <br />
            </>
        ) : null}
        {image ? <img src={image.src} alt={image.title} /> : null}
        {assets?.map((asset) => (
            <figure>
                {asset.player_embedded ? raw(asset.player_embedded) : asset.image_url ? <img src={asset.image_url} /> : projectUrl ? <a href={projectUrl}>View artwork on ArtStation</a> : null}
                {asset.title_formatted || asset.title ? <figcaption>{asset.title_formatted ? raw(asset.title_formatted) : asset.title}</figcaption> : null}
            </figure>
        ))}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<ArtstationDescription {...data} />);
