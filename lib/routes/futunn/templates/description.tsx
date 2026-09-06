import { renderToString } from 'hono/jsx/dom/server';

type DescriptionData = {
    pic?: string;
    abs?: string;
};

const FutunnDescription = ({ pic, abs }: DescriptionData) => (
    <>
        {pic ? <img src={pic} /> : null}
        {abs ? <p>{abs}</p> : null}
    </>
);

export const renderDescription = (data: DescriptionData) => renderToString(<FutunnDescription {...data} />);
