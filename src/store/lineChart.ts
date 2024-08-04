import { defineStore } from 'pinia'
import infection from "@/dataFile/infection_data.json"
import total_infection from "@/dataFile/total_infection.json"
import * as d3 from 'd3';

export const useLineStore = defineStore('lineChart', {

    state() {
        return {
            infection_list: infection['infections'],
            total_infection: total_infection
        }
    },

    actions: {
        // 绘制折线图的函数
        drawLineChart(svgId: string, data: number[], title: string): void {
            const svg = d3.select(svgId);
            const lineSvg: any = document.getElementById(svgId.slice(1));
            const style = window.getComputedStyle(lineSvg);
            const width = parseFloat(style.width.replace('px', ''));
            const height = parseFloat(style.height.replace('px', ''));

            const margin = { top: 30, right: 20, bottom: 50, left: 60 };
            const innerWidth = width - margin.left - margin.right;
            const innerHeight = height - margin.top - margin.bottom;

            const xScale = d3.scaleLinear()
                .domain([0, data.length - 1])
                .range([0, innerWidth]);

            const yScale = d3.scaleLinear()
                .domain([0, d3.max(data) || 0]) // 使用 || 处理可能的 undefined
                .range([innerHeight, 0]);

            const g = svg.append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`);

            const xAxis = d3.axisBottom(xScale);
            g.append('g').call(xAxis).attr('transform', `translate(0, ${innerHeight})`);

            const yAxis = d3.axisLeft(yScale);
            g.append('g').call(yAxis);

            const lineGenerator = d3.line<number[][number]>()
                .x((d, i) => xScale(i))
                .y(d => yScale(d));

            g.append('text')
                .text(title)
                .attr('font-size', '1em')
                .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 40})`)
                .attr('text-anchor', 'middle');

            g.append("path")
                .attr("d", lineGenerator(data) as string) // 强制转换为 string 类型
                .attr('fill', 'none')
                .attr('stroke-width', 2)
                .attr('stroke', 'red');

            // 创建工具提示
            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background-color", "white")
                .style("padding", "5px")
                .style("border", "1px solid #ccc")
                .style("border-radius", "5px")
                .style("opacity", 0);

            g.selectAll('circle')
                .data(data)
                .enter()
                .append('circle')
                .attr('r', 3)
                .attr('cx', (d, i) => xScale(i))
                .attr('cy', d => yScale(d))
                .style("opacity", 0)
                .on('mouseover', function (event, d) {
                    const i = data.indexOf(d);
                    d3.select(this).style('opacity', 1);
                    tooltip.html(`天数: ${i + 1}, 感染人数: ${d}`)
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY + 10}px`)
                        .style("opacity", 1);
                })
                .on('mouseout', function () {
                    d3.select(this).style('opacity', 0);
                    tooltip.style("opacity", 0);
                });
        },

        // 清空折线图的函数
        clearLineChart(svgId: string): void {
            d3.select(svgId).selectAll('*').remove();
        }
    }
})