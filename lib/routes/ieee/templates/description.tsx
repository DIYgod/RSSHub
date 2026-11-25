import { renderToString } from 'hono/jsx/dom/server';

type DescriptionItem = {
    abstract: string;
};

export const renderDescription = (item: DescriptionItem): string => renderToString(<p>{item.abstract}</p>);
