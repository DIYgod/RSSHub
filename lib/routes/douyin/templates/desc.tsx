import { raw } from 'hono/jsx';
import { renderToString } from 'hono/jsx/dom/server';

type DescData = {
    desc: string;
    media: string;
};

export const renderDesc = ({ desc, media }: DescData): string =>
    renderToString(
        <>
            {raw(desc)}
            <br />
            <br />
            {raw(media)}
        </>
    );
