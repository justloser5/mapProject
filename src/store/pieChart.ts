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

            //创建饼图
            const pie = d3.pie<PieData>().value(d => d.rate);
            //创建弧线
            const arc = d3.arc<d3.PieArcDatum<PieData>>().innerRadius(0).outerRadius(radius);
            //计算每个数据点对应的弧对象数组
            const arcs = pie(data);

            //设置对应的颜色
            const colors: { [key: string]: string } = {
                "绿化": "#32CD32",
                "水文": "#5b9ae7",
                "混凝土": "#778899"
            };

            //绘制饼图
            const drawPieChart = (svg: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>, arcs: d3.PieArcDatum<PieData>[]) => {
                svg.selectAll('.arc')
                    .data(arcs) //将数据绑定到选择的 SVG 元素
                    .enter() //获取数据中没有对应图形元素的部分
                    .append('g')
                    .attr('class', 'arc')
                    .append('path')
                    .attr('d', arc)
                    .style("fill", d => colors[d.data.title]);
            };

            //生成折线
            const generatePolyline = (selection: d3.Selection<SVGGElement, d3.PieArcDatum<PieData>, SVGGElement, unknown>) => {
                const points: { [key: string]: [number, number] } = {};
                const distance = radius + 15; //折线长度
                const extension = 85;  //延伸长度

                //添加折线
                selection.each(function (d, i) {
                    //获取当前弧的质心坐标
                    const centerX = arc.centroid(d)[0];
                    const centerY = arc.centroid(d)[1];
                    let X: number, Y: number;

                    //根据质心的 y 坐标判断弧是在饼图的下半部分还是上半部分，并计算 x 和 y 坐标
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

                    //根据 x 坐标的正负，计算折线延伸的 x 坐标
                    const extendedX = X > 0 ? X + extension : X - extension;

                    points[data[i].title] = [X, Y];

                    d3.select(this)
                        .append('polyline')
                        .attr('points', `${centerX},${centerY} ${X},${Y} ${extendedX},${Y}`)
                        .attr('stroke', colors[d.data.title])
                        .attr('fill', 'none');
                });

                //添加文本
                selection.each(function (d, i) {
                    const { title, rate } = data[i];
                    const [X, Y] = points[title];

                    //根据 x 坐标的正负计算文本偏移量
                    const textOffset = X > 0 ? 5 : -75;

                    //计算文本标签的 x 和 y 坐标
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

            //绘制折线
            svg.selectAll('.path-group')
                .data(arcs)
                .enter()
                .append('g')
                .attr('class', 'path-group')
                .call(generatePolyline);

            //绘制文本
            svg.append("text")
                .attr("x", 0)
                .attr("y", -radius - 40)
                .attr("text-anchor", "middle")
                .style("fill", "white")
                .style("font-size", "16px")
                .text(title);
        },

        //清空饼图
        clearPie(svgId: string): void {
            const svg = d3.select(`#${svgId}`);
            svg.selectAll('path').remove();
            svg.selectAll('polyline').remove();
            svg.selectAll('text').remove();
        }
    }

})