import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    description?: string;
    image?: {
        src?: string;
        title?: string;
    };
    assets?: Array<{
        asset_type?: string;
        player_embedded?: string;
        image_url?: string;
    }>;
};

const ArtstationDescription = ({ description, image, assets }: DescriptionData) => (
    <>
        {description ? (
            <>
                {raw(description)}
                <br />
            </>
        ) : null}
        {image ? <img src={image.src} alt={image.title} /> : null}
        {assets?.map((asset) => {
            if ((asset.asset_type === 'video' || asset.asset_type === 'video_clip') && asset.player_embedded) {
                return (
                    <>
                        {raw(asset.player_embedded)}
                        <br />
                    </>
                );
            }

            if (asset.asset_type === 'image' || asset.asset_type === 'cover') {
                return (
                    <>
                        <img src={asset.image_url} />
                        <br />
                    </>
                );
            }

            return null;
        })}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<ArtstationDescription {...data} />);
