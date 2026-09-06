import { renderToString } from 'hono/jsx/dom/server';

type FigureProps = {
    src: string;
    width?: string;
    height?: string;
};

const Figure = ({ src, width, height }: FigureProps) => (
    <figure>
        <img src={src} width={width} height={height} />
    </figure>
);

export const renderFigure = (props: FigureProps): string => renderToString(<Figure {...props} />);
