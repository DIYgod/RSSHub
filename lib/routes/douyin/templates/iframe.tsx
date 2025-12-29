import { renderToString } from 'hono/jsx/dom/server';

type IframeData = {
    content: string;
};

export const renderIframe = ({ content }: IframeData): string => {
    const srcdoc = `<!DOCTYPE html><html><head><meta name="referrer" content="no-referrer"></head><body>${content}</body></html>`;

    return renderToString(<iframe referrerpolicy="no-referrer" width="100%" height="150vh" frameborder="0" marginheight="0" marginwidth="0" style="border:0; margin:0; padding:0; width:100%; height:150vh;" srcdoc={srcdoc}></iframe>);
};
