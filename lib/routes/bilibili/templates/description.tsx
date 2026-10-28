import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionProps = {
    embed: boolean;
    ugc?: boolean;
    ogv?: boolean;
    aid?: string;
    cid?: string;
    bvid?: string;
    seasonId?: string;
    episodeId?: string;
    img?: string;
    description?: string;
};

const getPlayerUrl = (baseUrl: string, parameters: Record<string, string | undefined>) => {
    const url = new URL(baseUrl);
    for (const [key, value] of Object.entries(parameters)) {
        if (value !== undefined) {
            url.searchParams.set(key, value);
        }
    }
    return url.href;
};

const Description = ({ embed, ugc, ogv, aid, cid, bvid, seasonId, episodeId, img, description }: DescriptionProps) => (
    <>
        {embed ? (
            <>
                {ugc ? <iframe width="640" height="360" src={getPlayerUrl('https://player.bilibili.com/player.html', { aid, cid, bvid })} frameborder="0" allowfullscreen></iframe> : null}
                {ogv ? <iframe width="640" height="360" src={getPlayerUrl('https://www.bilibili.com/blackboard/html5mobileplayer.html', { seasonId, episodeId })} frameborder="0" allowfullscreen></iframe> : null}
                <br />
            </>
        ) : null}
        {img ? (
            <>
                <img src={img} />
                <br />
            </>
        ) : null}
        {description ? raw(description) : null}
    </>
);

export const renderDescription = (props: DescriptionProps): string => renderToString(<Description {...props} />);
