<template>
  <div class="container">
    <div class="mapContainer" id="mapContainer"></div>
    <lineChart />
  </div>
</template>


<script setup lang="ts">
import lineChart from "./lineChart.vue"
import { onMounted, onUnmounted } from "vue"
import AMapLoader from "@amap/amap-jsapi-loader"
import { useLineStore } from '@/store/lineChart'
import { usePieStore } from "@/store/pieChart"
import { type PieData } from '@/types'

const lineStore = useLineStore()
const pieStore = usePieStore()

let map: any = null;

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
        mapStyle: "amap://styles/grey"
      });

      // 创建自定义图层
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "600");
      svg.setAttribute("height", "600");
      svg.setAttribute("id", "svg"); // 设置 ID
      document.body.appendChild(svg); // 将 SVG 添加到文档中

      const customLayer = new AMap.CustomLayer(svg, {
        zIndex: 12,
        zooms: [3, 18]
      });

      map.add(customLayer);

      function addPolygon(data: any) {
        data.features.forEach(function (feature: any) {
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
          polygon.on('click', function (e: any) {

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
            infoWindow.open(map); // 打开信息窗体

          });
          polygon.on('mouseover', () => {
            polygon.setOptions({ fillOpacity: 0.7, fillColor: '#ffdf33' })

            let transformedData: PieData[] = [
              { title: "绿化", rate: feature.properties.green_rate },
              { title: "水文", rate: feature.properties.blue_rate },
              { title: "混凝土", rate: feature.properties.other_rate }
            ];

            pieStore.drawPie('svg', transformedData, feature.properties.Name)

            lineStore.clearLineChart("#partLineSvg")
            for (let index = 0; index < lineStore.infection_list.length; index++) {
              if (lineStore.infection_list[index]["Name"] == feature.properties.Name) {
                lineStore.drawLineChart("#partLineSvg", lineStore.infection_list[index]['daily_infected'], feature.properties.Name + "每日感染人数");
                break;
              }
            }

          })
          polygon.on('mouseout', () => {
            polygon.setOptions({ fillOpacity: 0.5, fillColor: feature.properties.fill_color })
            pieStore.clearPie('svg')
          })
          map.add(polygon)
        });
      }

      addPolygon(pieStore.data)

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
