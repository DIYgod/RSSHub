import { renderToString } from 'hono/jsx/dom/server';

type DescriptionProps = {
    embed: boolean;
    aid: string;
    img?: string;
};

const Description = ({ embed, aid, img }: DescriptionProps) => (
    <>
        {embed ? (
            <>
                <iframe width="640" height="360" src={`https://www.acfun.cn/player/${aid}`} frameborder="0" allowfullscreen></iframe>
                <br />
            </>
        ) : null}
        {img ? <img src={img} /> : null}
    </>
);

export const renderDescription = (props: DescriptionProps): string => renderToString(<Description {...props} />);
