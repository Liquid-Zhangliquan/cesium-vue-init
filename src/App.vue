<template>
  <div class="base-earth-main-wrap" v-show="map3dshow">
    <div ref="map3d" class="map-container" id="cesiumContainer"></div>
  </div>
</template>
<script>
import bus from '@/utils/bus';
import { PolylineTrailLinkMaterialProperty } from '@/utils/line';

export default {
  name: 'BaseMap',
  components: {},
  data() {
    return {
      map3dshow: true
    };
  },
  mounted() {
    this.cesiumInit();
  },
  methods: {
    cesiumInit() {
      const viewerOption = {
        geocoder: false, // 地理位置查询定位控件
        homeButton: false, // 默认相机位置控件
        timeline: false, // 时间滚动条控件
        navigationHelpButton: false, // 默认的相机控制提示控件
        fullscreenButton: false, // 全屏控件
        scene3DOnly: true, // 每个几何实例仅以3D渲染以节省GPU内存
        baseLayerPicker: false, // 底图切换控件
        animation: false, // 控制场景动画的播放速度控件
        terrainProvider: new Cesium.createWorldTerrain(), // 世界地形
        contextOptions: {
          webgl: {
            preserveDrawingBuffer: true
          }
        }
      };

      const viewer = new Cesium.Viewer('cesiumContainer', viewerOption);
      // viewer.scene.globe.enableLighting = true;
      // viewer.scene.globe.depthTestAgainstTerrain = true; // 防止模型漂移
      viewer._cesiumWidget._creditContainer.style.display = 'none'; // 隐藏版权
      window.viewer = viewer;

      this.$nextTick(() => {
        // DOM 现在更新了
        // 第一次emit on接收不到？
        // bus.$emit('cesiumReady');
      });
      this.initCameraEnd();
      this.load();
    },
    // 添加天地图注记
    loadImager() {
      const viewer = window.viewer;
      // 天地图
      // viewer.imageryLayers.addImageryProvider(
      //   new Cesium.TiandituImageryProvider({
      //     credit: new Cesium.Credit('http://t0.tianditu.gov.cn/img_w/wmts?'),
      //     token: '76d35ea95dafb0023ee631a25e260ec4'
      //   })
      // );
      viewer.imageryLayers.addImageryProvider(
        new Cesium.WebMapTileServiceImageryProvider({
          url:
            'https://t0.tianditu.gov.cn/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=76d35ea95dafb0023ee631a25e260ec4',
          layer: 'tdtAnnoLayer',
          style: 'default',
          format: 'image/jpeg',
          tileMatrixSetID: 'GoogleMapsCompatible',
          show: false
        })
      );
    },
    initCameraEnd() {
      const viewer = window.viewer;
      const camera = viewer.camera;
      viewer.scene.camera.moveEnd.addEventListener(evt => {
        const heading = camera.heading;
        const pitch = camera.pitch;
        const roll = camera.roll;
        const position = camera.position;
        const cartographic = Cesium.Cartographic.fromCartesian(position);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        const height = cartographic.height;
        console.log(longitude + ',' + latitude + ',' + height + ',' + heading + ',' + pitch + ',' + roll);
      });
    },
    flyInit() {
      const viewer = window.viewer;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(109.8074934154574, 31.91985964527413, 7500),
        orientation: {
          heading: 5.928204839875907,
          pitch: -1.4854982106813184,
          roll: 6.2770896402646095
        }
      });
    },
    load() {
      let item = viewer.entities.add({
        name: 'PolylineTrail',
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights([
            50,
            30,
            250000,
            60,
            30,
            250000,
            60,
            32,
            250000,
            50,
            32,
            250000
          ]),
          width: 15,
          material: new PolylineTrailLinkMaterialProperty(Cesium.Color.WHITE, 3000, 1)
        }
      });
    }
  }
};
</script>
<style lang="less">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
}
.base-earth-main-wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  .map-container {
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    float: left;
    overflow: hidden;
  }
}
</style>
