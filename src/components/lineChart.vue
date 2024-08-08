<template>
    <div class="lineContainer">
        <div class="lineChartDiv">
            <svg id="totalLineSvg" width="100%" height="100%">
                <image x="93%" y="0" width="25" height="25" xlink:href="../image/ZoomIn.svg"
                    @click="enlarge($parent, 0)">
                </image>
            </svg>
            <svg id="partLineSvg" width="100%" height="100%">
                <image x="93%" y="0" width="25" height="25" xlink:href="../image/ZoomIn.svg"
                    @click="enlarge($parent, 1)">
                </image>
            </svg>
            <button @click="clearSvg($parent)">清空画布</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useLineStore } from '@/store/lineChart';
import { onMounted } from "vue";

const lineStore = useLineStore();
const totalSvgId = "#totalLineSvg";
const partSvgID = "#partLineSvg";

//设置坐标轴最大刻度
let totalMaxScale = Math.max(...lineStore.total_infection.daily_infected);
let maxScale: number = 0;
for (let infection of lineStore.infection_list) {
    let i = Math.max(...infection['daily_infected']);
    maxScale = Math.max(maxScale, i);
}

//清空画布
function clearSvg(parent: any) {
    lineStore.clearLineChart(partSvgID);
    lineStore.drawAxes(partSvgID, maxScale);

    parent.lineNumber = 1;
    parent.streets.length = 0;
    parent.colors.length = 0;
}

//放大画布
function enlarge(parent: any, index: number) {

    //如果放大画布已经存在，则清空重新绘制
    if (parent.svgFlag === 0) {
        lineStore.clearLineChart("#svg");
    }

    parent.svgFlag = 0;

    //将矩形和图像的可见性设置会可见
    const rect = parent.customSvg.getElementById("rect");
    const img = parent.customSvg.getElementById("img");
    rect.setAttribute("visibility", "visible");
    img.setAttribute("visibility", "visible");

    //index区别绘制的是总的病例折线还是乡镇病例折线
    if (index) {
        lineStore.drawAxes("#svg", maxScale);
        for (let i = 0; i < parent.streets.length; i++) {
            for (let infection of lineStore.infection_list) {
                if (infection["Name"] === parent.streets[i]) {
                    lineStore.drawLine("#svg", maxScale, infection["daily_infected"], parent.colors[i], i + 1, parent.streets[i]);

                    break;
                }
            }
        }
    } else {
        lineStore.drawAxes("#svg", totalMaxScale, "广州市每日感染人数");
        lineStore.drawLine("#svg", totalMaxScale, lineStore.total_infection.daily_infected, '#ffaa00');
    }

    //为img添加点击事件，用来关闭放大画布
    img.addEventListener('click', function () {
        parent.svgFlag = 1;
        rect.setAttribute("visibility", "hidden");
        img.setAttribute("visibility", "hidden");
        lineStore.clearLineChart("#svg");

    });

}


onMounted(() => {

    lineStore.drawAxes(totalSvgId, totalMaxScale, "广州市每日感染人数");
    lineStore.drawLine(totalSvgId, totalMaxScale, lineStore.total_infection.daily_infected, '#ffaa00');
    lineStore.drawAxes(partSvgID, maxScale);

});

</script>

<style scoped>
.lineContainer {
    flex: 0 0 30%;
    /* 右边占 30% */
    /* height: 100vh; */
    background-color: #353535;

}

.lineChartDiv {
    height: 97%;
    margin: 10px;
    background-color: #2b2b2b;
    display: flex;
    flex-direction: column;
}

svg {
    flex: 0 0 42%;
    width: 100%;
    height: 30%;
    margin-top: 15px;
    margin-bottom: 25px;
    /* background-color: aqua; */
}

button {
    margin-top: -45px;
    margin-left: 30px;
    width: 40%;
    height: px;
    align-self: center;
    background-color: #353535;
    color: aliceblue;
}
</style>