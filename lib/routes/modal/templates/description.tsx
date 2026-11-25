import { renderToString } from 'hono/jsx/dom/server';

export const renderFallbackDescription = (summary: string | undefined, link: string, title: string): string => renderToString(<p>{summary || <a href={link}>{title}</a>}</p>);
