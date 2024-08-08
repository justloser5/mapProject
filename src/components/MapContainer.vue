<template>
  <div class="container">
    <div class="mapContainer" id="mapContainer"></div>
    <lineChart />
  </div>
</template>

<script setup lang="ts">
import lineChart from "./lineChart.vue";
import { onMounted, onUnmounted, ref, watch } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import { useLineStore } from '@/store/lineChart';
import { usePieStore } from "@/store/pieChart";
import useColor from '@/hooks/useColor';
import useCustomLayer from "@/hooks/useCustomLayer";
import { type PieData } from '@/types';
import { storeToRefs } from "pinia";

//解构
const lineStore = useLineStore();
const { lineToPolygon } = storeToRefs(lineStore);
const pieStore = usePieStore();
const { getColor, colorDistance } = useColor();
const { customSvg } = useCustomLayer();

// 将自定义图层添加到页面上
document.body.appendChild(customSvg);

let map: any = null;
let svgFlag = ref(1); //标记放大画布是否出现，出现则关闭地图互动，防止画布出现抖动
let lineNumber = ref(1); //标记线条的数量，大于4则不再绘制
let streets: string[] = []; //记录已经绘制的街道名
let colors: string[] = [];  //记录绘制使用的颜色
let polygonMap = new Map(); //存储多边形数据
let maxScale: number = 0; //计算折线图坐标轴的最大刻度
for (let infection of lineStore.infection_list) {
  let i = Math.max(...infection['daily_infected']);
  maxScale = Math.max(maxScale, i);
}

defineExpose({ lineNumber, streets, colors, customSvg, svgFlag }); //交给子组件的属性

onMounted(() => {
  (window as any)._AMapSecurityConfig = {
    securityJsCode: "4c33ee0d4a6465c365191033656ef6a0",
  };
  AMapLoader.load({
    key: "3b4cdd7b425a5b49a564211932f0031b", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ["AMap.Scale"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
  })
    .then((AMap) => {

      map = new AMap.Map("mapContainer", {
        // 设置地图容器id
        center: [113.273889, 23.030791], //广州塔经纬度
        zoom: 10.5,
        mapStyle: "amap://styles/grey",

      });

      //创建自定义画布
      const customLayer = new AMap.CustomLayer(customSvg, {
        zIndex: 12,
        zooms: [3, 18]
      });

      //将设置好的svg画布添加到地图上
      map.add(customLayer);

      //绘制多边形并添加相应的事件监听
      function addPolygon(data: any) {
        data.features.forEach(function (feature: any) {
          //设置多边形属性
          let polygon = new AMap.Polygon({
            path: feature.geometry.coordinates,
            fillColor: feature.properties.fill_color,
            strokeOpacity: 1,
            fillOpacity: 0.5,
            strokeColor: '#2b8cbe',
            strokeWeight: 1,
            strokeStyle: 'dashed',
            strokeDasharray: [5, 5],
          });

          //添加点击事件，点击显示信息窗体
          polygon.on('click', (e: any) => {

            //信息窗体的内容
            let content = [
              "名称:  " + feature.properties.Name,
              "区域层级:  " + feature.properties.layer,
              "区划代码:  " + feature.properties.code,
              "病例:  " + feature.properties.infections,
            ];

            //创建 infoWindow 实例
            let infoWindow = new AMap.InfoWindow({
              content: content.join("<br>"), //传入字符串拼接的 DOM 元素
              anchor: "top-center",
            });

            infoWindow.setPosition(e.lnglat); // 设置信息窗体位置
            if (svgFlag.value) { infoWindow.open(map); } // 打开信息窗体

            //如果放大画布未显示，且该街道病例折线并未绘制过，则绘制相应折线
            if (svgFlag.value && !streets.includes(feature.properties.Name)) {

              for (let index = 0; index < lineStore.infection_list.length; index++) {

                if (lineStore.infection_list[index]["Name"] == feature.properties.Name && lineNumber.value <= 4) {

                  let randomColor = getColor("#ff0000", "#00ff00", Math.random());

                  //调整颜色，保证出现的颜色均不相似，提高区分度
                  while (colors.some(color => colorDistance(randomColor, color) < 30)) {
                    randomColor = getColor("#ff0000", "#0000ff", Math.random());
                  }

                  colors.push(randomColor);
                  streets.push(feature.properties.Name);

                  lineStore.drawLine("#partLineSvg", maxScale, lineStore.infection_list[index]['daily_infected'], randomColor, lineNumber.value, feature.properties.Name);
                  lineNumber.value++;

                  break;
                }
              }
            }

          });

          //添加鼠标悬浮事件
          polygon.on('mouseover', () => {
            polygon.setOptions({ fillOpacity: 0.7, fillColor: '#ffdf33' });

            let transformedData: PieData[] = [
              { title: "绿化", rate: feature.properties.green_rate },
              { title: "水文", rate: feature.properties.blue_rate },
              { title: "混凝土", rate: feature.properties.other_rate }
            ];

            if (svgFlag.value) { pieStore.drawPie('svg', transformedData, feature.properties.Name); }

          });

          //添加鼠标移开事件
          polygon.on('mouseout', () => {
            polygon.setOptions({ fillOpacity: 0.5, fillColor: feature.properties.fill_color });
            if (svgFlag.value) { pieStore.clearPie('svg'); }
          });

          //将多边形数据添加到polygonMap中
          polygonMap.set(feature.properties.Name, polygon);

          map.add(polygon);

        });
      }

      addPolygon(pieStore.data); //调用函数，在地图上绘制多边形

      //设置监听事件，根据svgFlag(放大画布)调整地图互动状态
      watch(svgFlag, (newValue, oldValue) => {
        console.log(newValue, oldValue);
        map.setStatus({
          dragEnable: newValue,
          keyboardEnable: newValue,
          doubleClickZoom: newValue,
          zoomEnable: newValue,
          rotateEnable: newValue
        });
      });

      watch(lineToPolygon, () => {
        if (lineToPolygon.value && svgFlag.value) {
          //获取多边形区域中点的经纬度
          const myLngLat = polygonMap.get(lineToPolygon.value).getBounds().getCenter();
          //将地图中心设置为多边形中点
          map.setCenter([myLngLat.lng, myLngLat.lat]);
          //主动触发悬浮事件，将多边形高亮
          polygonMap.get(lineToPolygon.value).emit('mouseover');
          //清除饼图，防止重叠
          pieStore.clearPie('svg');
        }

        //将lineToPolygon.value设置为空，以便连续点击仍能触发监听
        lineToPolygon.value = '';

      });

    })
    .catch((e) => {
      console.log(e);
    });
});

onUnmounted(() => {
  map?.destroy();
});
</script>

<style scoped>
.container {
  display: flex;
  /* 使用 flexbox 布局 */
  width: 100%;
  height: 100vh;
  /* 设置高度为视口高度 */

}

.mapContainer {
  flex: 0 0 70%;
  /* 左边占 70% */
  height: 100vh;
}
</style>