<template>
    <div class="lineContainer">
        <svg id="totalLineSvg" width="100%" height="100%"></svg>
        <svg id="partLineSvg" width="100%" height="100%"></svg>
    </div>
</template>

<script setup lang="ts">
import { useLineStore } from '@/store/lineChart'
import { onMounted } from "vue"

const lineStore = useLineStore()

onMounted(() => {
    var totalSvgId = "#totalLineSvg"
    var partSvgID = "#partLineSvg"
    lineStore.drawLineChart(totalSvgId, lineStore.total_infection.daily_infected, "广州市每日感染人数")
    lineStore.drawLineChart(partSvgID, lineStore.infection_list[0]['daily_infected'], "温泉镇每日感染人数")
})

</script>

<style scoped>
.lineContainer {
    flex: 0 0 30%;
    /* 右边占 30% */
    height: 100vh;
    background-color: rgb(208, 208, 208);
    display: flex;
    flex-direction: column;
}

svg {
    flex: 0 0 42%;
    width: 100%;
    height: 30%;
    margin-top: 15px;
    margin-bottom: 25px;
}
</style>