import { renderToString } from 'hono/jsx/dom/server';

export interface BenchmarkMetricValue {
    label: string;
    value: string;
}

export interface BenchmarkRow {
    metric: string;
    values: BenchmarkMetricValue[];
    change?: string;
}

export interface ChartLabel {
    x: number;
    y: number;
    anchor: 'start' | 'middle' | 'end';
    text: string;
}

export const renderBenchmarkFigure = (title: string, columns: readonly string[], rows: readonly BenchmarkRow[]): string => {
    const hasChanges = rows.some((row) => row.change);
    return renderToString(
        <figure>
            {title && <figcaption>{title}</figcaption>}
            <table>
                <thead>
                    <tr>
                        <th>Benchmark</th>
                        {columns.map((col) => (
                            <th key={col}>{col}</th>
                        ))}
                        {hasChanges && <th>Change</th>}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.metric}>
                            <td>{row.metric}</td>
                            {row.values.map((item) => (
                                <td key={`${row.metric}-${item.label}`}>{item.value}</td>
                            ))}
                            {hasChanges && <td>{row.change ?? ''}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </figure>
    );
};

export const renderChartLabels = (labels: readonly ChartLabel[]): string =>
    renderToString(
        <g font-size="12" fill="#666666">
            {labels.map((label) => (
                <text key={`${label.x}-${label.y}-${label.text}`} x={label.x} y={label.y} text-anchor={label.anchor}>
                    {label.text}
                </text>
            ))}
        </g>
    );

export const renderFallbackDescription = (summary: string): string => renderToString(<p>{summary}</p>);
