import { defineStore } from 'pinia'
import data from "@/dataFile/data.json"
import * as d3 from 'd3'
import { type PieData } from '@/types'


export const usePieStore = defineStore('pieChart', {

    state() {
        return {
            data: data
        }
    },

    actions: {
        drawPie(svgId: string, data: PieData[], title: string): void {
            const radius = 50;

            // 选择已存在的 SVG 元素
            const svg = d3.select<SVGSVGElement, unknown>(`#${svgId}`)
                .append('g')
                .attr('transform', `translate(${150}, ${120})`);

            const pie = d3.pie<PieData>().value(d => d.rate);
            const arc = d3.arc<d3.PieArcDatum<PieData>>().innerRadius(0).outerRadius(radius);
            const arcs = pie(data);

            const colors: { [key: string]: string } = {
                "绿化": "#32CD32",
                "水文": "#5b9ae7",
                "混凝土": "#778899"
            };

            const drawPieChart = (svg: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>, arcs: d3.PieArcDatum<PieData>[]) => {
                svg.selectAll('.arc')
                    .data(arcs)
                    .enter()
                    .append('g')
                    .attr('class', 'arc')
                    .append('path')
                    .attr('d', arc)
                    .style("fill", d => colors[d.data.title]);
            };

            const generatePolyline = (selection: d3.Selection<SVGGElement, d3.PieArcDatum<PieData>, SVGGElement, unknown>) => {
                const points: { [key: string]: [number, number] } = {};
                const distance = radius + 15;
                const extension = 85;

                selection.each(function (d, i) {
                    const centerX = arc.centroid(d)[0];
                    const centerY = arc.centroid(d)[1];
                    let X: number, Y: number;

                    if (centerY <= 0) {
                        const cos = Math.abs(centerX / Math.sqrt(centerX ** 2 + centerY ** 2));
                        const sin = Math.abs(centerY / Math.sqrt(centerX ** 2 + centerY ** 2));
                        X = centerX >= 0 ? cos * distance : -cos * distance;
                        Y = -sin * distance;
                    } else {
                        const cos = Math.abs(centerY / Math.sqrt(centerX ** 2 + centerY ** 2));
                        const sin = Math.abs(centerX / Math.sqrt(centerX ** 2 + centerY ** 2));
                        X = centerX > 0 ? sin * distance : -sin * distance;
                        Y = cos * distance;
                    }

                    const extendedX = X > 0 ? X + extension : X - extension;

                    points[data[i].title] = [X, Y];

                    d3.select(this)
                        .append('polyline')
                        .attr('points', `${centerX},${centerY} ${X},${Y} ${extendedX},${Y}`)
                        .attr('stroke', colors[d.data.title])
                        .attr('fill', 'none');
                });

                selection.each(function (d, i) {
                    const { title, rate } = data[i];
                    const [X, Y] = points[title];

                    const textOffset = X > 0 ? 5 : -75;
                    const textX = X + textOffset;
                    const textY = Y - 10;

                    d3.select(this)
                        .append('text')
                        .attr('x', textX)
                        .attr('y', textY + 5)
                        .attr('fill', colors[d.data.title])
                        .text(`${title} (${rate.toFixed(2)}%)`)
                        .style('font-size', '14px');
                });
            };

            drawPieChart(svg, arcs);

            svg.selectAll('.path-group')
                .data(arcs)
                .enter()
                .append('g')
                .attr('class', 'path-group')
                .call(generatePolyline);

            svg.append("text")
                .attr("x", 0)
                .attr("y", -radius - 40)
                .attr("text-anchor", "middle")
                .style("fill", "white")
                .style("font-size", "16px")
                .text(title);
        },

        clearPie(svgId: string): void {

            d3.select(`#${svgId}`).selectAll('*').remove();
        }
    }

})