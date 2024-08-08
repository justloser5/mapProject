import { defineStore } from 'pinia';
import infection from "@/dataFile/infection_data.json";
import total_infection from "@/dataFile/total_infection.json";
import * as d3 from 'd3';
import useLineChart from '@/hooks/useLineChart';

const { getAxisData, getDate } = useLineChart();

export const useLineStore = defineStore('lineChart', {

    state() {
        //返回病例数据
        return {
            infection_list: infection['infections'],
            total_infection: total_infection,
            lineToPolygon: '',
        };
    },

    actions: {

        // 绘制坐标轴的函数，svgID：svg画布id，maxScale：y轴最大刻度，title：可选属性，折线图的标题
        drawAxes(svgId: string, maxScale: number, title?: string): void {
            const svg = d3.select(svgId);
            const { margin, innerWidth, innerHeight } = getAxisData(svgId);

            //创建线性尺度
            const xScale = d3.scaleLinear()
                .domain([0, 180]) //设置尺度的输入值范围
                .range([0, innerWidth]); //设置尺度的输出值范围

            const yScale = d3.scaleLinear()
                .domain([0, maxScale])
                .range([innerHeight, 0]); //d3的y轴是倒置的

            const g = svg.append('g') //创建了一个新的 g 元素，并将其添加到 SVG 中
                .attr('transform', `translate(${margin.left}, ${margin.top})`); //设置了一个平移变换

            //创建x轴，ticks设置刻度数量，tickFormat设置刻度格式，转化为日期
            const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d => getDate(180 - (d as number)));
            //call应用xAxis，调整刻度文本颜色
            g.append('g').call(xAxis).attr('transform', `translate(0, ${innerHeight})`)
                .attr('class', 'xAxis')
                .selectAll('.tick text')
                .style('fill', '#ffffff');

            const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d => (d as number) / 1000 + ' k');
            g.append('g').call(yAxis)
                .attr('class', 'yAxis')
                .selectAll('.tick text')
                .style('fill', '#ffffff');

            //创建网格线，将刻度线反向延长模拟网格线,并将刻度文本隐藏
            const xGrid = d3.axisTop(xScale).ticks(5).tickSize(innerHeight);
            g.append('g').call(xGrid).attr('transform', `translate(0, ${innerHeight})`)
                .attr('class', 'xGrid')
                .selectAll('.tick text')
                .attr('display', 'none');


            const yGrid = d3.axisRight(yScale).ticks(5).tickSize(innerWidth);
            g.append('g').call(yGrid)
                .attr('class', 'yGrid')
                .selectAll('.tick text')
                .attr('display', 'none');

            //选中所有刻度线，调整颜色和线宽
            g.selectAll('.tick line')
                .attr('stroke', '#353535')
                .attr('stroke-width', 1);

            //将x轴颜色染深
            g.select('.yGrid')
                .select('.tick line')
                .attr('stroke', 'black')
                .attr('stroke-width', 1);

            //如果有title，则添加到图像底部
            if (title) {
                g.append('text')
                    .text(title)
                    .attr('font-size', '1em')
                    .attr('fill', '#ffffff')
                    .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 40})`)
                    .attr('text-anchor', 'middle');
            }
        },

        /** 绘制折线的函数。
         *  svgID：svg画布id，maxScale：y轴最大刻度，data：病例数据，lineColor：折线颜色，
         *  flag：可选属性，记录线条的个数，streetName：可选属性，街道名称 
         */
        drawLine(svgId: string, maxScale: number, data: number[], lineColor: string, flag?: number, streetName?: string): void {

            const store = this;

            const svg = d3.select(svgId);
            const { margin, innerWidth, innerHeight } = getAxisData(svgId);

            const xScale = d3.scaleLinear()
                .domain([0, data.length])
                .range([0, innerWidth]);

            const yScale = d3.scaleLinear()
                .domain([0, maxScale])
                .range([innerHeight, 0]);

            const g = svg.append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`);

            //创建线生成器，d3.line是创建折线图的函数
            const lineGenerator = d3.line<number[][number]>()
                .x((d, i) => xScale(i)) //计算每个数据点在 x 轴上的位置
                .y(d => yScale(d)); //计算每个数据点在 y 轴上的位置

            //添加折线
            g.append("path")
                .attr("d", lineGenerator(data))
                .attr('fill', 'none')
                .attr('stroke-width', 3)
                .attr('stroke', lineColor);

            // 创建工具提示
            const tooltip = d3.select("body").append("div") //在 body 内部添加 div
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background-color", "#ffffff")
                .style("padding", "5px")
                .style("border", `4px solid ${lineColor}`)
                .style("border-radius", "5px")
                .style("opacity", 0);

            g.selectAll('circle')
                .data(data) //选择所有的 circle 元素，并将 data 与这些元素进行绑定
                .enter() //获取数据中没有对应图形元素的部分
                .append('circle') //为没有对应图形元素的数据项创建新的 circle 元素
                .attr('r', 3)
                .attr('cx', (d, i) => xScale(i)) //计算坐标
                .attr('cy', d => yScale(d))
                .style("opacity", 0) //设置为不可见
                .on('click', function () {
                    console.log('被点击了', store.lineToPolygon);
                    store.lineToPolygon = streetName || '';
                })
                .on('mouseover', function (event, d) {
                    const i = data.indexOf(d); //获取数据索引
                    d3.select(this).style('opacity', 1); //鼠标悬停时设置为可见
                    const tooltipElement = document.querySelector('.tooltip');

                    //设置工具提示的内容
                    tooltip.html(`${getDate(180 - i)} : ${d}`)
                        .style("left", () => {
                            //调整工具框内容，防止超出可用屏幕边界
                            const maxWidth: any = document.documentElement.clientWidth;
                            const toolWidth: any = event.pageX + tooltipElement?.clientWidth;
                            const toolPosition = (toolWidth < maxWidth) ? 10 : toolWidth - maxWidth;
                            return `${event.pageX - toolPosition - 10}px`;
                        })
                        .style("top", `${event.pageY + 10}px`)
                        .style("opacity", 1);
                })
                .on('mouseout', function () {
                    d3.select(this).style('opacity', 0);
                    tooltip.style("opacity", 0);
                });

            //绘制圆形图标
            if (flag) {
                g.append('circle')
                    .attr('cx', innerWidth - 85)  // 调整 x 坐标以放在折线旁边
                    .attr('cy', -10 + 30 * flag)  // 调整 y 坐标
                    .attr('r', 7)  // 圆形半径
                    .attr('fill', lineColor); // 颜色与折线一致
            }

            //在圆形图标旁边绘制文本
            if (flag && streetName) {
                g.append('text')
                    .attr('x', innerWidth - 74)  // 调整 x 坐标以放在圆形图标旁边
                    .attr('y', -9 + 30 * flag)  // 调整 y 坐标
                    .attr('dy', '0.33em')  // 垂直对齐
                    .text(streetName)  // 文本内容
                    .attr('fill', lineColor)// 文本颜色与折线一致
                    .attr('font-size', '14px');

            }

        },

        // 清空折线图的函数
        clearLineChart(svgId: string): void {
            const svg = d3.select(svgId);
            svg.selectAll('path').remove();
            svg.selectAll('circle').remove();
            svg.selectAll('text').remove();
            svg.selectAll('.tick line').remove();
        }
    }
});