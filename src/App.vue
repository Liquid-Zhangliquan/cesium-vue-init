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
      Cesium.Ion.defaultAccessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMDZkYjNmOS1kZjBiLTRjNDktOWUyMS1jNDE4NWM0NTAzN2YiLCJpZCI6MzMxMzAsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTgwNDM2Mjd9.eNJtn8iNyaIfl16r3scqF-jdQzn_JSlygDcXLe2TFwY';
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
      window.scene = viewer.scene;

      this.$nextTick(() => {
        // DOM 现在更新了
        // 第一次emit on接收不到？
        // bus.$emit('cesiumReady');
      });
      this.initCameraEnd();
      this.loadSatellite();
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
    loadLine() {
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
    },
    loadSatellite() {
      // 1 雷达位置计算
      window.radarLng = -180;
      window.radarLat = 0;
      // 1.1 雷达的高度
      var length = 400000.0;
      // 1.2 地面位置(垂直地面)
      var positionOnEllipsoid = Cesium.Cartesian3.fromDegrees(radarLng, radarLat);
      // 1.3 中心位置
      var centerOnEllipsoid = Cesium.Cartesian3.fromDegrees(radarLng, radarLat, length * 0.5);
      // 1.4 顶部位置(卫星位置)
      var topOnEllipsoid = Cesium.Cartesian3.fromDegrees(radarLng, radarLat, length);
      // 1.5 矩阵计算
      var modelMatrix = Cesium.Matrix4.multiplyByTranslation(
        Cesium.Transforms.eastNorthUpToFixedFrame(positionOnEllipsoid),
        new Cesium.Cartesian3(0.0, 0.0, length * 0.5),
        new Cesium.Matrix4()
      );
      // 卫星
      window.satellite = viewer.entities.add({
        position: new Cesium.CallbackProperty((time, result) => {
          return Cesium.Cartesian3.fromDegrees(radarLng, radarLat, length * 0.5);
        }, false),
        model: {
          uri: 'data/glb/satellite.glb',
          scale: 10000,
          runAnimations: true,
          clampAnimations: true,
          color: Cesium.Color.fromAlpha(Cesium.Color.RED, parseFloat(1.0)),
          colorBlendMode: Cesium.ColorBlendMode.MIX,
          colorBlendAmount: 0.1
        }
      });
      // 卫星轨道
      const SatelliteLine = viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            -180,
            0,
            length * 0.5,
            -90,
            0,
            length * 0.5,
            0,
            0,
            length * 0.5,
            90,
            0,
            length * 0.5,
            180,
            0,
            length * 0.5
          ]),
          width: 2,
          material: new Cesium.PolylineOutlineMaterialProperty({
            color: Cesium.Color.fromCssColorString('#00f804'),
            outlineColor: Cesium.Color.fromCssColorString('#00f804'),
            outlineWidth: 1
          })
        }
      });

      // 4 创建雷达放射波
      // 4.1 先创建Geometry
      var cylinderGeometry = new Cesium.CylinderGeometry({
        length: length,
        topRadius: 0.0,
        bottomRadius: length * 0.5,
        // vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
        vertexFormat: Cesium.MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat
      });
      // 4.2 创建GeometryInstance
      var redCone = new Cesium.GeometryInstance({
        geometry: cylinderGeometry,
        modelMatrix: modelMatrix
      });
      // 4.3 创建Primitive
      var radar = scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: [redCone],
          appearance: new Cesium.MaterialAppearance({
            // 自定义纹理
            material: new Cesium.Material({
              fabric: {
                type: 'VtxfShader1',
                uniforms: {
                  color: new Cesium.Color(0.2, 1.0, 0.0, 1.0),
                  repeat: 30.0,
                  offset: 0.0,
                  thickness: 0.3
                },
                source: `
                                uniform vec4 color;
                                uniform float repeat;
                                uniform float offset;
                                uniform float thickness;

                                czm_material czm_getMaterial(czm_materialInput materialInput)
                                {
                                    czm_material material = czm_getDefaultMaterial(materialInput);
                                    float sp = 1.0/repeat;
                                    vec2 st = materialInput.st;
                                    float dis = distance(st, vec2(0.5));
                                    float m = mod(dis + offset, sp);
                                    float a = step(sp*(1.0-thickness), m);

                                    material.diffuse = color.rgb;
                                    material.alpha = a * color.a;

                                    return material;
                                }
                            `
              },
              translucent: false
            }),
            faceForward: false, // 当绘制的三角面片法向不能朝向视点时，自动翻转法向，从而避免法向计算后发黑等问题
            closed: true // 是否为封闭体，实际上执行的是是否进行背面裁剪
          })
        })
      );

      // 5 动态修改雷达材质中的offset变量，从而实现动态效果。
      viewer.scene.preUpdate.addEventListener(() => {
        var offset = radar.appearance.material.uniforms.offset;
        offset -= 0.001;
        if (offset > 1.0) {
          offset = 0.0;
        }
        radar.appearance.material.uniforms.offset = offset;
      });
      window.radar = radar;
      this.doRadarAnimate();
    },
    doRadarAnimate() {
      radarLng += 0.01;
      const pos = Cesium.Cartesian3.fromDegrees(radarLng, radarLat);
      const modelMatrix = Cesium.Matrix4.multiplyByTranslation(
        Cesium.Transforms.eastNorthUpToFixedFrame(pos),
        new Cesium.Cartesian3(0.0, 0.0, length * 0.5),
        new Cesium.Matrix4()
      );
      radar.modelMatrix = modelMatrix;
      requestAnimationFrame(this.doRadarAnimate);
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
