<template>
  <div class="base-earth-main-wrap" v-show="map3dshow">
    <div ref="map3d" class="map-container" id="cesiumContainer"></div>
  </div>
</template>
<script>
import bus from '@/utils/bus';

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
      Cesium.Ion.defaultAccessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMDZkYjNmOS1kZjBiLTRjNDktOWUyMS1jNDE4NWM0NTAzN2YiLCJpZCI6MzMxMzAsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTgwNDM2Mjd9.eNJtn8iNyaIfl16r3scqF-jdQzn_JSlygDcXLe2TFwY';
      let imageryProvider = new Cesium.WebMapTileServiceImageryProvider({
        url:
          'http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=7711a24780452f03bb7c02fba98183b9',
        layer: 'img4',
        style: 'default',
        format: 'tiles',
        tileMatrixSetID: 'w',
        credit: new Cesium.Credit('天地图全球影像服务'),
        show: false
      });
      const viewerOption = {
        geocoder: false, // 地理位置查询定位控件
        homeButton: false, // 默认相机位置控件
        timeline: false, // 时间滚动条控件
        infoBox: false, // 默认弹窗
        navigationHelpButton: false, // 默认的相机控制提示控件
        fullscreenButton: false, // 全屏控件
        scene3DOnly: true, // 每个几何实例仅以3D渲染以节省GPU内存
        baseLayerPicker: false, // 底图切换控件
        animation: false, // 控制场景动画的播放速度控件
        imageryProvider: imageryProvider,
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
      window.scene = viewer.scene;

      this.$nextTick(() => {
        // DOM 现在更新了
        // 第一次emit on接收不到？
        // bus.$emit('cesiumReady');
      });
      this.flyInit();
      this.initCameraEnd();
      this.addLeftClickEvent();
      this.loadFeature();
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
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(111.91218965086307, 37.70432535392143, 6124418.455506831),
        orientation: {
          heading: 8.881784197001252e-16,
          pitch: -1.5684766455716765,
          roll: 0
        }
      });
    },
    loadFeature() {
      let source = viewer.dataSources.getByName('fea-custom')[0];
      if (!source) {
        source = new Cesium.CustomDataSource('fea-custom');
        viewer.dataSources.add(source);
      }
      let PointEntity = source.entities.add({
        name: 'fea-point',
        position: Cesium.Cartesian3.fromDegrees(Number(114), Number(30)),
        billboard: {
          image: require('./assets/images/23.png'),
          scale: 1,
          width: 23,
          height: 23,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          scaleByDistance: new Cesium.NearFarScalar(1000, 1, 1000000, 0.9)
        },
        properties: {
          type: 'point'
        }
      });
      let LineEntity = source.entities.add({
        name: 'fea-line',
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([110, 25, 116, 35]),
          width: 2,
          clampToGround: true,
          material: new Cesium.Color.fromCssColorString('#ff0000').withAlpha(0.9)
        },
        properties: {
          type: 'line'
        }
      });
      let PolygonEntity = source.entities.add({
        name: 'fea-polygib',
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArray([90, 25, 100, 30, 100, 40, 80, 40])
          ),
          outline: true,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 4,
          material: Cesium.Color.fromRandom({ alpha: 1.0 })
        },
        properties: {
          type: 'polygon'
        }
      });
    },
    // 注册鼠标点击事件
    addLeftClickEvent() {
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(evt => {
        const pick = viewer.scene.pick(evt.position);
        if (Cesium.defined(pick) && pick.id) {
          const entity = pick.id;
          if (entity.properties) {
            this.entityHandle(entity);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      handler.setInputAction(evt => {
        const pick = viewer.scene.pick(evt.startPosition);
        if (Cesium.defined(pick) && pick.id) {
          document.body.style.cursor = 'pointer';
        } else {
          document.body.style.cursor = '';
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.setInputAction(evt => {
        const pick = viewer.scene.pick(evt.position);
        if (Cesium.defined(pick) && pick.id) {
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    },
    entityHandle(entity) {
      const properties = entity.properties.getValue();
      console.log(properties);
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
