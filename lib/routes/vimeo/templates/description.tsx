import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type DescriptionProps = {
    videoUrl: string;
    vdescription?: string;
};

const Description = ({ videoUrl, vdescription }: DescriptionProps) => (
    <>
        <iframe width="640" height="360" src={`https://player.vimeo.com/video${videoUrl}`} frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>
        {vdescription ? <p>{raw(vdescription)}</p> : null}
    </>
);

export const renderDescription = (props: DescriptionProps): string => renderToString(<Description {...props} />);
