import * as d3 from 'd3';

export default function () {
    function getDate(x: number): string {
        // 获取当前日期
        const currentDate = new Date();

        // 计算x天之前的日期
        currentDate.setDate(currentDate.getDate() - x);

        // 构建并返回格式化的日期字符串
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();

        // 格式化月份和日期为两位数
        const formattedMonth = month < 10 ? `0${month}` : `${month}`;
        const formattedDay = day < 10 ? `0${day}` : `${day}`;

        // 返回格式为'YYYY-MM-DD'的日期字符串
        return `${year}-${formattedMonth}-${formattedDay}`;
    }

    function getAxisData(svgId: string) {

        //计算可用页面的宽度和高度
        const lineSvg: any = document.getElementById(svgId.slice(1));
        const style = window.getComputedStyle(lineSvg);
        const width = parseFloat(style.width.replace('px', ''));
        const height = parseFloat(style.height.replace('px', ''));

        //设置边距，计算折线图的宽度和高度
        const margin = { top: 30, right: 20, bottom: 50, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        return { margin, innerWidth, innerHeight }
    }

    return { getDate, getAxisData }
}