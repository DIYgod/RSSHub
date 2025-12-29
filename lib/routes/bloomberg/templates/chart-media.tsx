import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

type ChartData = {
    title?: string;
    subtitle?: string;
    fallback?: string;
    chartAlt?: string;
    chartId?: string;
    url?: string;
    source?: string;
    footnote?: string;
};

export const renderChartMedia = ({ chart }: { chart: ChartData }) =>
    renderToString(
        <figure>
            {chart.title ? <>{chart.title}</> : null}
            {chart.subtitle ? <p>{chart.subtitle}</p> : null}
            <noscript>
                <img src={chart.fallback} alt={chart.chartAlt} loading="lazy" style="display:block; margin-left:auto; margin-right:auto; width:100%;" />
            </noscript>
            <iframe
                id={chart.chartId}
                title={chart.title}
                referrerpolicy="no-referrer"
                width="100%"
                height="150vh"
                frameborder="0"
                marginheight="0"
                marginwidth="0"
                loading="lazy"
                scrolling="no"
                style="border:0; margin:0; padding:0; width:100%; height:150vh;"
                src={chart.url}
            ></iframe>
            {chart.source ? (
                <figcaption>
                    <div class="source">{raw(chart.source)}</div>
                    {chart.footnote ? <p>{chart.footnote}</p> : null}
                </figcaption>
            ) : null}
        </figure>
    );
