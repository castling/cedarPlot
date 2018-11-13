<template>
  <el-menu class="menu-switches">

    <el-submenu index="time">
      <template slot="title">
        <span>TIME STEP</span>
      </template>
      <el-input-number class="timestep" v-model="options.time.value" @change="step($event)"> </el-input-number>
      <div class="time-control">
        <button type="button" class="el-button icon-step-backward"
          :class="{'is-disabled':!initialized}"
          :disabled="!initialized"
          @click="step(0)" ></button>
        <button type="button" class="el-button icon-play-backward"
          :class="{active:play.run===-1,'is-disabled':!initialized}"
          :disabled="!initialized"
          @click="play.run = -1" ></button>
        <button type="button" class="el-button icon-stop1"
          @click="play.run = 0" ></button>
        <button type="button" class="el-button icon-play1"
          :class="{active:play.run===1,'is-disabled':!initialized}"
          :disabled="!initialized"
          @click="play.run = 1" ></button>
        <button type="button" class="el-button icon-step-forward"
          :class="{'is-disabled':!initialized}"
          :disabled="!initialized"
          @click="step(options.time.max)" ></button>
        <button type="button" class="el-button icon-spinner11" :class="{active:play.loop}"
          @click="play.loop = !play.loop" ></button>
      </div>
      <div class="form-control">
        <el-input-number v-model="options.fps" controls-position="right"></el-input-number>
        <label class="form-label">FPS</label>
      </div>
    </el-submenu>

    <el-submenu index="range">
      <template slot="title">
        <span>COORD RANGE</span>
      </template>
      <el-submenu v-for="dir in ['x','y','z']" :index="`range-${dir}`" :key="dir">
        <template slot="title">
          <span>{{dir.toUpperCase()}} DIRECTION</span>
        </template>
        <div class="form-control__inline">
          <label>
            <el-switch v-model="layouts.scene[`${dir}axis`].autorange"></el-switch>
            <span class="form-label">AUTO RANGE</span>
          </label>
        </div>
        <div class="form-control">
          <el-input-number v-model="layouts.scene[`${dir}axis`].range[0]" :controls="false" :disabled="layouts.scene[`${dir}axis`].autorange"></el-input-number>
          <label class="form-label">{{dir.toUpperCase()}} MIN</label>
        </div>
        <div class="form-control">
          <el-input-number v-model="layouts.scene[`${dir}axis`].range[1]" :controls="false" :disabled="layouts.scene[`${dir}axis`].autorange"></el-input-number>
          <label class="form-label">{{dir.toUpperCase()}} MAX</label>
        </div>
      </el-submenu>
    </el-submenu>

    <el-submenu index="scale">
      <template slot="title">
        <span>SCALE</span>
      </template>
      <div class="form-control">
        <el-select class="color-select"
          v-model="layouts.scene.aspectmode"
          placeholder="Select mode">
          <el-option label="auto" value="auto"></el-option>
          <el-option label="manual" value="manual"></el-option>
          <el-option label="cube" value="cube"></el-option>
          <el-option label="data" value="data"></el-option>
        </el-select>
        <label class="form-label">SCALE MODE</label>
      </div>
      <div class="form-control">
        <el-input-number v-model="layouts.scene.aspectratio.x" controls-position="right" :min="0" :step="0.1"></el-input-number>
        <label class="form-label">X SCALE</label>
      </div>
      <div class="form-control">
        <el-input-number v-model="layouts.scene.aspectratio.y" controls-position="right" :min="0" :step="0.1"></el-input-number>
        <label class="form-label">Y SCALE</label>
      </div>
      <div class="form-control">
        <el-input-number v-model="layouts.scene.aspectratio.z" controls-position="right" :min="0" :step="0.1"></el-input-number>
        <label class="form-label">Z SCALE</label>
      </div>
    </el-submenu>

    <el-submenu index="color">
      <template slot="title">
        <span>COLOR PALETTE</span>
      </template>
      <div class="form-control__inline">
        <label>
          <el-switch v-model="options.shadeMarker"></el-switch>
          <span class="form-label">VALUE SHADE</span>
        </label>
      </div>
      <div class="form-control__inline">
        <label>
          <el-switch v-model="styles.marker.cauto" :disabled="!options.shadeMarker"></el-switch>
          <span class="form-label">AUTO RANGE</span>
        </label>
      </div>
      <div class="form-control">
        <el-input-number v-model="styles.marker.cmin" :controls="false" :disabled="!options.shadeMarker||styles.marker.cauto"></el-input-number>
        <label class="form-label">MIN VALUE</label>
      </div>
      <div class="form-control">
        <el-input-number v-model="styles.marker.cmax" :controls="false" :disabled="!options.shadeMarker||styles.marker.cauto"></el-input-number>
        <label class="form-label">MAX VALUE</label>
      </div>
      <div class="form-control">
        <el-select class="color-select"
          v-model="styles.marker.colorscale"
          popper-class="color-select__dropdown"
          placeholder="Select">
          <el-option
            v-for="(colors,name) in colorPalettes"
            :key="name"
            :label="name"
            :value="name">
            <span class="color-select__label">{{ name }}</span>
            <colorbar class="color-select__sample" :colors="colors" :name="name"></colorbar>
          </el-option>
        </el-select>
        <label class="form-label">COLOR PALETTE</label>
      </div>
      <div class="form-control__inline">
        <label>
          <el-switch v-model="styles.marker.reversescale" :disabled="!options.shadeMarker"></el-switch>
          <span class="form-label">REVERSED PALETTE</span>
        </label>
      </div>
    </el-submenu>

    <el-submenu index="marker">
      <template slot="title">
        <span>MARKER</span>
      </template>
      <div class="form-control">
        <el-input-number v-model="styles.marker.opacity" controls-position="right" :min="0" :max="1" :step="0.1"></el-input-number>
        <label class="form-label">OPACITY</label>
      </div>
      <div class="form-control">
        <el-input-number v-model="styles.marker.size" controls-position="right" :min="0"></el-input-number>
        <label class="form-label">SIZE</label>
      </div>
      <div class="form-control color-picker-control">
        <el-color-picker v-model="styles.marker.line.color" show-alpha></el-color-picker>
        <label class="form-label">OUTLINE COLOR</label>
      </div>
    </el-submenu>

    <el-submenu index="camera">
      <template slot="title">
        <span>CAMERA</span>
      </template>
      <el-submenu v-for="type in ['center','eye','up']" :key="type"
        :index="`camera-${type}`">
        <template slot="title">
          <span>{{type.toUpperCase()}}</span>
        </template>
        <div class="form-control" v-for="x in ['x','y','z']" :key="x">
          <el-input-number v-model="layouts.scene.camera[type][x]" :controls="false"></el-input-number>
          <label class="form-label">{{x.toUpperCase()}}</label>
        </div>
      </el-submenu>
      <el-submenu index="camera-setting">
        <template slot="title">
          <span>CACHE</span>
        </template>
        <div class="cache-control">
          <div class="item">
            <div class="title">
              <el-input v-model="saveCameraName" :disabled="!initialized"></el-input>
            </div>
            <div class="buttons">
              <el-button type="primary" :disabled="!initialized" @click="saveCamera">SAVE</el-button>
            </div>
          </div>
          <div class="item" v-for="item in cameras" :key="item.name">
            <div class="title">
              {{item.name}}
            </div>
            <div class="buttons">
              <el-button type="primary" :disabled="!initialized" @click="$emit('load-camera',item.name)">LOAD</el-button>
              <el-button type="primary" @click="$emit('remove-camera',item.name)">REMOVE</el-button>
            </div>
          </div>
        </div>
      </el-submenu>
    </el-submenu>

    <el-submenu index="save">
      <template slot="title">
        <span>SAVE FUNCTION</span>
      </template>

      <div class="save-buttons">
        <el-button type="primary" @click="$emit('save-image')">SAVE AS IMAGE</el-button>
        <el-button type="primary" @click="$emit('save-movie')">SAVE AS MOVIE</el-button>
      </div>
    </el-submenu>

  </el-menu>
</template>

<!--
<style src="element-ui/lib/theme-chalk/menu.css"></style>
<style src="element-ui/lib/theme-chalk/submenu.css"></style>
<style src="element-ui/lib/theme-chalk/input-number.css"></style>
<style src="element-ui/lib/theme-chalk/switch.css"></style>
<style src="element-ui/lib/theme-chalk/select.css"></style>
<style src="element-ui/lib/theme-chalk/option.css"></style>
<style src="element-ui/lib/theme-chalk/color-picker.css"></style>
<style src="element-ui/lib/theme-chalk/button.css"></style>
-->
<style scoped src="../styles/fonts.css"></style>
<style lang="scss" scoped>
  .menu-switches {
    .el-menu--inline {
      .el-input-number {
        height: auto;
        width: 100%;
        z-index: 0;
        /deep/ {
          .el-input-number__increase,
          .el-input-number__decrease {
            height: calc( 100% - 2px );
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
        &.is-controls-right /deep/ {
          .el-input-number__increase,
          .el-input-number__decrease {
            height: calc( 50% - 1px );
          }
        }
      }
    }
    .el-submenu {
      background-color: #cdd6e5;
      /*
      background-color: #eef1f6;
      */
      border-bottom: 1px solid rgba(0,0,0,0.2);

      .el-submenu {
        background-color: #dee3ed;
        /*
        background-color: white;
        &:last-child {
        */
          border-bottom: none;
        /*
        }
        */
      }
      /deep/ .el-submenu__title {
        font-size: 1rem;
      }
    }
    .form-control {
      position: relative;
      .form-label {
        position: absolute;
        top: 0;
        left: .4rem;
        opacity: 0.5;
        font-size: 70%;
        pointer-events: none;
      }

      &.color-picker-control {
        display: flex;
        justify-content: flex-end;
        padding-right: 15px;
      }
    }
    .form-control__inline {
      padding: 5px;
      .form-label {
        font-size: 80%;
        opacity: 0.8;
      }
    }

    .time-control {
      display: flex;
      flex-wrap: wrap;
      button {
        padding: 10px 5px;
        flex-grow: 1;
        flex-shrink: 0;
        flex-basis: 30px;
        &.active {
          color: #fff;
          background-color: #409eff;
          border-color: #409eff;
          box-shadow: -1px 0 0 0 #8cc5ff;
        }
      }
      .el-button + .el-button {
        margin-left: 0;
      }
    }
    .cache-control {
      display: flex;
      flex-direction: column;
      .item {
        display: flex;
        flex-direction: column;
        &:not(:first-child) {
          border-top: 1px solid rgba(0,0,0,0.4);
        }
        .title {
          flex-grow: 1;
        }
        .buttons {
          align-self: flex-end;
        }
      }
    }
    .save-buttons {
      display: flex;
      flex-direction: column;
      padding: 5px 10px;
      .el-button + .el-button {
        margin-left: 0;
        margin-top: 5px;
      }
    }
  }
</style>
<style lang="scss">
  .color-select__dropdown {
    .el-select-dropdown__item {
      display: flex;
      justify-content: space-between;
      position: relative;
      height: 100%;
    }
    .color-select__label {
    }
    .color-select__sample {
      width: 50%;
      margin: 2px 0;
    }
  }
</style>

<script>
import colorPalettes from './colorScales.js'
import Colorbar from './colorbar.vue'
  /*
import ElMenu from 'element-ui/lib/menu.js'
import ElSubmenu from 'element-ui/lib/submenu.js'
import ElInputNumber from 'element-ui/lib/input-number.js'
import ElSwitch from 'element-ui/lib/switch.js'
import ElSelect from 'element-ui/lib/select.js'
import ElOption from 'element-ui/lib/option.js'
import ElColorPicker from 'element-ui/lib/color-picker.js'
import ElButton from 'element-ui/lib/button.js'
*/

export default {
  components: {
    /*
    ElMenu,
    ElSubmenu,
    ElInputNumber,
    ElSwitch,
    ElSelect,
    ElOption,
    ElColorPicker,
    ElButton,
    */
    Colorbar,
  },
  props: [
    'initialized',
    'options',
    'layouts',
    'styles',
    'play',
    'cameras',
  ],
  data() {
    return {
      colorPalettes,
      saveCameraName: '',
    }
  },
  computed: {
  },
  mounted() {
    this.updateCameraName()
  },
  methods: {
    step(d) {
      this.$nextTick(() => {
        this.$emit('step',d)
      })
    },
    toggleLoop() {
      this.$nextTick(() => {
        this.$emit('loop',this.play.loop = !this.play.loop)
      })
    },
    saveCamera() {
      if( this.cameras.find(d=>d.name===this.saveCameraName) ) {
        alert(`setting name [${this.saveCameraName}] is duplicated. Please change the name`)
      } else {
        this.$emit('save-camera',this.saveCameraName)
        this.updateCameraName()
      }
    },
    updateCameraName() {
      let n = 0
      let name = `#${n}`
      while( this.cameras.find(d=>d.name===name) ) {
        n += 1
        name = `#${n}`
      }
      this.saveCameraName = name
    },
  },
}
</script>
