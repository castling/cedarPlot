import Resize from 'vue-resize-directive'
import { Sketch } from 'vue-color'
import { uniq, isNumber, compact } from 'lodash'

import SwitchSet from './switchSet.vue'
import SlideController from './slideController.vue'
import SaveMovieModal from './saveMovieModal.vue'
import getFileData from './getFileData.js'
import saveAnimService from './saveAnimService/index.js'
import saveMovieFormats from './saveAnimService/filetypes.js'
import colorPalettes from './colorPalettes.js'
import colorScales from './colorScales.js'

/*
import ElContainer from 'element-ui/lib/container.js'
import ElMain from 'element-ui/lib/main.js'
import ElHeader from 'element-ui/lib/header.js'
import ElAside from 'element-ui/lib/aside.js'
import ElUpload from 'element-ui/lib/upload.js'
import ElButton from 'element-ui/lib/button.js'
import ElProgress from 'element-ui/lib/progress.js'
import ElInput from 'element-ui/lib/input.js'
import ElInputNumber from 'element-ui/lib/input-number.js'
import ElForm from 'element-ui/lib/form.js'
import ElFormItem from 'element-ui/lib/form-item.js'
import ElSelect from 'element-ui/lib/select.js'
import ElOption from 'element-ui/lib/option.js'
*/
//import Plotly from 'ify-loader!plotly.js/dist/plotly.min.js'

let toPlain = d => JSON.parse(JSON.stringify(d))

export default {
  components: {
    /*
    ElContainer,
    ElMain,
    ElHeader,
    ElAside,
    ElUpload,
    ElButton,
    ElProgress,
    ElInput,
    ElInputNumber,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
   */
    SwitchSet,
    SlideController,
    SaveMovieModal,
    SketchPicker: Sketch,
  },
  directives: {
    Resize,
  },
  data() {
    return {
      initialized: false,
      hasStorage: false,

      loadedData: [],
      data: [],
      colors: [],

			modalType: null,
      colorParam: {
        color: null,
        name: '',
      },
      saveImageParam: {
        format: 'png',
        width: 800,
        height: 600,
        filename: 'plot',
      },
      saveMovieParam: {
        format: 'webm',
        width: 800,
        height: 600,
        filename: 'plot',
        framerate: 2,
        quality: 100,

        startStep: 0,
        endStep: null,
        status: {
          total: 0,
          step: 0,
          state: '',
          message: '',
        },
        saving: false,
        converting: false,
      },
      saveImageRules: {
        format: [
          { required: true, message: 'Please select valid type', trigger: 'blur' },
        ],
        width: [
          { required: true, message: 'Please input valid number', trigger: 'change' },
          { type: 'number', message: 'Please input valid number', trigger: 'change' },
        ],
        heigth: [
          { required: true, message: 'Please input valid number', trigger: 'change' },
          { type: 'number', message: 'Please input valid number', trigger: 'change' },
        ],
        filename: [
          { required: true, message: 'Please input valid number', trigger: 'change' },
          { type: 'string', message: 'Please input valid number', trigger: 'change' },
        ],
      },
      saveImageFormats: {
        png: {
          name: 'PNG'
        },
        jpeg: {
          name: 'JPG'
        },
        svg: {
          name: 'SVG',
        },
        webp: {
          name: 'WebP',
        },
      },
      saveMovieFormats,

      showFileSelector: true,
      showSwitchSet: true,
      loadingState: {
        run: false,
        status: null,
        percentage: 0,
      },

      animation: {
        run: false,
        loop: true,
      },

      options: {
        columns: {
          x: 1,
          y: 2,
          z: 3,
          v: 4,
        },
        idColumn: 0,
        maxColumns: Infinity,
        time: {
          value: 0,
          max: 0,
        },
        fps: 2,
        shadeMarker: false,
      },
      config: {
        responsive: true,
        displaylogo: false,
        modeBarButtonsToRemove: [
//          'sendDataToCloud',
        ],
      },
      layout: {
        dragmode: 'orbit',
        margin: {
          l: 0,
          r: 0,
          t: 0,
          b: 0,
        },
        legend: {
          y: 0.5,
          yref: 'paper',
        },
        scene: {
          aspectmode: 'cube',
          aspectratio: {
            x: 1,
            y: 1,
            z: 1,
          },
          xaxis: {
            autorange: true,
            range: [ 0, 1 ],
          },
          yaxis: {
            autorange: true,
            range: [ 0, 1 ],
          },
          zaxis: {
            autorange: true,
            range: [ 0, 1 ],
          },
          camera: {
            up: {
            },
            center: {
            },
            eye: {
            },
          },
        },
      },
      style: {
        marker: {
          symbol: 'circle',
          size: 5,
          opacity: 1,
          line: {
           color: 'rgba(0,0,0,0.2)',
           width: 0.5,
          },
          showscale: false,
          color: [],
          colorscale: 'Bluered',
          colorbar: {
            xanchor: 'right',
            x: 1,
            ypad: 70,
          },
          reversescale: false,
          cauto: true,
          cmin: 0,
          cmax: 1,
        },
      },
      presetColors: [
        '#000000',
        '#ffffff',
        '#1f77b4',
        '#ff7f0e',
        '#2ca02c',
        '#d62728',
        '#9467bd',
        '#8c564b',
        '#e377c2',
        '#7f7f7f',
        '#bcbd22',
        '#17becf',
      ],

      cameraSettings: [],
    }
  },
  computed: {
    /*
    data() {
      return this.loadedData[ this.options.time.value || 0 ] || []
    },
    */
    maxTimeStep() {
      return this.options.time.max + 1
    },
  },
  watch: {
    loadedData: {
      handler() {
        this.options.time.max = this.loadedData.length-1
        this.options.maxColumns = Math.min.apply(null,this.loadedData.map(d=>{
          return Math.min.apply(null,d.map(x=>x.length-1))
        }))
        this.setStep()
      },
      deep: true,
    },
    data: {
      handler() {
        if( this.data.length ) {
//          this.options.maxColumns = Math.min.apply(null,this.data.map(d=>d.length-1))
          this.setTraces()
          this.update()
          this.setValueRange()
          'xyz'.split('').forEach(x => this.getCoordRange(x))
          app.container._fullLayout.scene.camera
          this.initialized = true
        } else {
          this.initialized = false
        }
      },
      deep: true,
    },
    'options.time.value'() {
      this.setStep().then(() => {
        if( this.saveMovieParam.saving ) {
          this.saveMovieStep()
        } else {
          this.setTimeStep(this.options.time.value + this.animation.run)
        }
      },() => {
      })
    },
    'options.columns.x'() {
      this.setTraces()
      this.update()
      this.getCoordRange('x')
    },
    'options.columns.y'() {
      this.setTraces()
      this.update()
      this.getCoordRange('y')
    },
    'options.columns.z'() {
      this.setTraces()
      this.update()
      this.getCoordRange('z')
    },
    'options.columns.v'() {
      this.setTraces()
      this.update()
      this.setValueRange()
    },
    'layout.scene.aspectmode'(mode) {
      this.relayout('scene.aspectmode',mode)
    },
    'layout.scene.aspectratio.x': {
      handler(d) {
        this.relayout('scene.aspectratio.x',d)
      },
      deep: true,
    },
    'layout.scene.aspectratio.y': {
      handler(d) {
        this.relayout('scene.aspectratio.y',d)
      },
      deep: true,
    },
    'layout.scene.aspectratio.z': {
      handler(d) {
        this.relayout('scene.aspectratio.z',d)
      },
      deep: true,
    },
    'layout.scene.xaxis.autorange'(auto) {
      this.setAxisAuto('x',auto)
    },
    'layout.scene.yaxis.autorange'(auto) {
      this.setAxisAuto('y',auto)
    },
    'layout.scene.zaxis.autorange'(auto) {
      this.setAxisAuto('z',auto)
    },
    'layout.scene.xaxis.range': {
      handler(range) {
        this.setAxisRange('x',range)
      },
      deep: true,
    },
    'layout.scene.yaxis.range': {
      handler(range) {
        this.setAxisRange('y',range)
      },
      deep: true,
    },
    'layout.scene.zaxis.range': {
      handler(range) {
        this.setAxisRange('z',range)
      },
      deep: true,
    },
    'layout.scene.camera.center': {
      handler(d) {
        if( this.container && this.container.layout.scene && this.container.layout.scene.camera.center ) {
          let org = this.container.layout.scene.camera.center || {}
          if( d.x!==org.x || d.y!==org.y || d.z!==org.z ) {
            this.relayout({
              'scene.camera.center.x': d.x,
              'scene.camera.center.y': d.y,
              'scene.camera.center.z': d.z,
            })
          }
        }
      },
      deep: true,
    },
    'layout.scene.camera.eye': {
      handler(d) {
        if( this.container && this.container.layout.scene && this.container.layout.scene.camera.eye ) {
          let org = this.container.layout.scene.camera.eye || {}
          if( d.x!==org.x || d.y!==org.y || d.z!==org.z ) {
            this.relayout({
              'scene.camera.eye.x': d.x,
              'scene.camera.eye.y': d.y,
              'scene.camera.eye.z': d.z,
            })
          }
        }
      },
      deep: true,
    },
    'layout.scene.camera.up': {
      handler(d) {
        if( this.container && this.container.layout.scene && this.container.layout.scene.camera.up ) {
          let org = this.container.layout.scene.camera.up || {}
          if( d.x!==org.x || d.y!==org.y || d.z!==org.z ) {
            this.relayout({
              'scene.camera.up.x': d.x,
              'scene.camera.up.y': d.y,
              'scene.camera.up.z': d.z,
            })
          }
        }
      },
      deep: true,
    },
    'style.marker.opacity'(value) {
      this.restyle({
        'marker.opacity': value,
      })
    },
    'style.marker.size'(value) {
      this.restyle({
        'marker.size': value,
      })
    },
    'style.marker.line.color'(value) {
      this.restyle({
        'marker.line.color': value,
      })
    },
    'style.marker.colorscale'(value) {
      let color = colorPalettes.indexOf(value) > -1 ? value : toPlain(colorScales[value])
      this.restyle({
        'marker.colorscale': [color],
      })
    },
    'style.marker.reversescale'(value) {
      this.restyle({
        'marker.reversescale': value,
      })
    },
    'style.marker.cauto'(value) {
//      this.restyle({
//        'marker.cauto': value,
//      })
      this.setValueRange()
    },
    'style.marker.cmin'(value) {
      this.restyle({
        'marker.cmin': value,
      })
    },
    'style.marker.cmax'(value) {
      this.restyle({
        'marker.cmax': value,
      })
    },
    'options.shadeMarker'(value) {
      if( this.container._fullData.length ) {
        this.restyle({
          'marker.showscale': value,
        },0)
      }
      this.setTraceColor()
    },
    'animation.run'(d) {
      this.setTimeStep(this.options.time.value + d)
    },
    colors: {
      handler() {
        let markers = this.container.data.map(d=>d.marker)
        let nums = markers.map((d,i)=>d.color!==this.colors[i]?i:false).filter(d=>d!==false)
        if( !this.options.shadeMarker && nums.legth ) {
          this.restyle({
            'marker.color': this.nums.map(i=>this.colors[i]),
          },nums)
        }
      },
      deep: true,
    },
    modalType(type,old) {
      if( type==null && old=='saveMovie' ) {
        this.saveMovieCancel()
      }
    },
  },
  mounted() {
window.app=this
//window.Plotly=Plotly
    this.init().then(() => {
      this.setCameraWatches()
    })
  },
  methods: {
    init() {
      this.hasStorage = !!window.localStorage
      this.initCameraSettings()

      return this.ready = import(
        /* webpackChunkName: 'Plotly' */
        'ify-loader!plotly.js/dist/plotly-gl3d'
//        'ify-loader!plotly.js/dist/plotly'
//        'ify-loader!plotly.js/dist/plotly.min.js'
      ).then(({default: Plotly}) => {
        this.Plotly = Plotly
        this.Plotly.newPlot('canvas',[],toPlain(this.layout), toPlain(this.config))
        this.container = this.$el.querySelector('#canvas')
        this.setEvent()
      })
    },
    setCameraWatches() {
      let camera
      app.container.on('plotly_afterplot',()=> {
        if( this.container._fullLayout.scene ) {
          this.$set(this.layout.scene,'camera',this.container._fullLayout.scene.camera)
        }
      })
      app.container.on('plotly_relayout',d=> {
        if( camera = d['scene.camera'] ) {
          this.$set(this.layout.scene,'camera',toPlain(camera)||{
            up: {},
            center: {},
            eye: {},
          })
        }
      })
    },
    resizeHandler() {
      this.Plotly.Plots.resize('canvas')
    },
    restyle(...opt) {
      this.Plotly.restyle('canvas',...opt)
    },
    relayout(...opt) {
      this.Plotly.relayout('canvas',...opt);
    },
    update() {
      let df = this.Plotly.redraw('canvas')
      df.then(() => {
        this.$set(this,'colors',this.container._fullData.map(d=>d.marker.color))
        this.setValueRange()
        'xyz'.split('').forEach(x => this.getCoordRange(x))
      })
      return df
    },
    setStep() {
      return new Promise((resolve,reject) => {
        this.data = this.loadedData[ this.options.time.value || 0 ] || []
        if( this.data.length ) {
          this.setTraces()
          let df = this.update()
          setTimeout(() => {
            df.then(() => {
              this.initialized = true
              resolve()
            })
          },1000/this.options.fps)
        } else {
          reject()
        }
      })
    },
    setTimeStep(t) {
      if( t < 0 ) {
        if( this.animation.loop ) {
          t += (Math.floor( -t / this.maxTimeStep )+1) * this.maxTimeStep
        } else {
          t = 0
          this.animation.run = 0
        }
      } else if( t > this.options.time.max ) {
        if( this.animation.loop ) {
          t -= Math.floor( t / this.maxTimeStep ) * this.maxTimeStep
        } else {
          t = this.options.time.max
          this.animation.run = 0
        }
      }
      this.options.time.value = t
    },
    setTraces() {
      let traces = this.container.data
      let ids = uniq(this.data.map(d=>d[this.options.idColumn]))
      ids.forEach(id => {
        let num = traces.findIndex(d=>d.id===id)
        let trace = traces[num]
        if( trace==null ) {
          num = traces.length
          traces.push(trace = {
            id: id,
            name: `id:${id}`,
            type: 'scatter3d',
            x: [],
            y: [],
            z: [],
            mode: 'markers',
//            marker: clone(this.style.marker),
            marker: toPlain(this.style.marker),
          })
        }
        let data = this.data.filter(d=>d[this.options.idColumn]===id)
        trace.x = data.map(d=>d[this.options.columns.x])
        trace.y = data.map(d=>d[this.options.columns.y])
        trace.z = data.map(d=>d[this.options.columns.z])
        trace.marker.color = this.options.shadeMarker ?  data.map(d=>d[this.options.columns.v]) : this.colors[num]
      })
      if( traces.length ) {
        traces[0].marker.showscale = this.options.shadeMarker
      }
    },
    setTraceColor() {
      this.container.data.forEach(trace => {
        trace.marker.color = this.options.shadeMarker ?
          this.data.filter(d=>d[this.options.idColumn]===trace.id).map(d=>d[this.options.columns.v]) :
          trace.marker.color = null
      })
      return this.update()
    },
    setValueRange() {
      if( this.style.marker.cauto ) {
        let cmin = Infinity
        let cmax = -Infinity
        this.data.forEach(d => {
          let v = d[this.options.columns.v]
          if( isNumber(v) ) {
            cmin = Math.min(v,cmin)
            cmax = Math.max(v,cmax)
          }
        })
        this.style.marker.cmin = cmin
        this.style.marker.cmax = cmax
/*
        this.restyle({
          'marker.cmin': this.style.marker.cmin,
          'marker.cmax': this.style.marker.cmax,
        })
*/
      }
    },
    getCoordRange(x) {
      if( this.layout.scene[`${x}axis`].autorange && this.container._fullLayout.scene ) {
        this.layout.scene[`${x}axis`].range = this.container._fullLayout.scene[x+'axis'].range
      }
    },
    setAxisAuto(x,auto) {
      if( this.container._fullLayout.scene ) {
        this.relayout({
          [`scene.${x}axis.autorange`]: auto,
        })
        if( auto ) {
          this.getCoordRange(x)
        } else {
          this.relayout({
            [`scene.${x}axis.range`]: this.layout.scene[`${x}axis`].range,
          })
        }
      }
    },
    setAxisRange(x,range) {
      if( this.container && this.container._fullLayout.scene ) {
        if( !this.layout.scene[`${x}axis`].autorange ) {
          this.relayout({
            [`scene.${x}axis.range`]: range,
          })
        }
      }
    },
    setDatafile(file) {
      this.$refs.upload.clearFiles()
      this.loadingState.run = true
      getFileData(file.raw).progress(res=>{
        this.loadingState.percentage = res.percentage
      }).then(res=>{
        this.loadingState.status = 'success'
        this.loadingState.percentage = 100

        this.$nextTick(() => {
          let loadedData = this.reshapeData(res)
          setTimeout(() => {
            this.loadedData = loadedData
            this.$nextTick(() => {
              this.loadingState.run = false
              this.loadingState.status = null
              this.loadingState.percentage = 0
            })
          },600)
        })
      })
    },
    reshapeData(data) {
      let res = [[]]
      let n = 0
      data.split('\n').map(d=>compact(d.split(/[ \t]+/)).map(d=>Number(d))).forEach(d=> {
        if( d.length===1 && res[n].length ) {
          n++
          res[n] = []
        } else if( d.length>1 ) {
          res[n].push(d)
        }
      })
      return res
    },
    clearUploadFile() {
      this.$refs.upload.clearFiles()
    },
    setEvent() {
      this.$el.querySelector('.plotly .main-svg .infolayer').addEventListener('contextmenu',e=>{
        if( e.path[0].classList.contains('legendtoggle') ) {
          e.preventDefault()
          let name = e.path[1].querySelector('.legendtext').textContent
          this.showColorModal(name)
          return false
        }
      })
    },
    showColorModal(name) {
      let color = this.container._fullData.find(d=>d.name===name).marker.color
      this.colorParam = {
        name,
        color,
      }
      this.modalType = 'changeColor'
    },
    changeColor(color) {
      this.colorParam.color = color.hex
    },
    updateColor() {
      let num = this.container._fullData.findIndex(d=>d.name===this.colorParam.name)
      this.$set(this.colors,num,this.colorParam.color)
      this.modalType = null
    },
    openSaveImageModal() {
      this.modalType = 'saveImage'
    },
    openSaveMovieModal() {
      if( this.saveMovieParam.endStep == null ) {
        this.saveMovieParam.endStep = this.options.time.max
      }
      this.modalType = 'saveMovie'
    },
    saveImage() {
      this.Plotly.downloadImage('canvas', this.saveImageParam)
      this.modalType = null
    },
    saveMovie() {
      this.saveMovieParam.saving = true

      this._temporaryStep = this.options.time.value

      this.$set(this.saveMovieParam,'status', {
        total: this.saveMovieParam.endStep - this.saveMovieParam.startStep + 1,
        step: 0,
        state: 'GENERATING MOVIE',
        message: 'adding images',
      })

      let filename = this.saveMovieParam.filename + '.' + this.saveMovieParam.format

      this.saveService = new saveAnimService({
        filename,
        framerate: this.saveMovieParam.framerate,
        quality: this.saveMovieParam.quality,
        type: this.saveMovieParam.format,
        width: this.saveMovieParam.width,
        height: this.saveMovieParam.height,
      })

      if( this.options.time.value === this.saveMovieParam.startStep ) {
        this.saveMovieStep()
      } else {
        this.$nextTick(() => {
          this.options.time.value = this.saveMovieParam.startStep
        })
      }
    },
    saveMovieStep() {
      if( this.saveMovieParam.saving ) {
        let df = this.Plotly.toImage('canvas',{
          format: 'png',
          width: this.saveMovieParam.width,
          height: this.saveMovieParam.height,
        })
        df.then(url => {
          return new Promise((resolve,reject) => {
            let img = new Image()
            img.onload = () => {
              resolve(img)
            }
            img.src = url
          })
        }).then(img => {
          this.saveMovieParam.status.step += 1

          this.saveService.add(img)

          if( this.saveMovieParam.status.step < this.saveMovieParam.status.total ) {
            this.$nextTick(() => {
              if( this.saveMovieParam.saving ) {
                this.options.time.value = this.saveMovieParam.startStep + this.saveMovieParam.status.step
              }
            })
          } else {
            this.saveMovieFinished()
          }
        })
        return df
      }
    },
    saveMovieFinished() {
      this.saveMovieParam.saving = false
      this.saveMovieParam.converting = true
      this.saveMovieParam.status.state = 'converting movie'
      this.saveMovieParam.status.message = '## start converting movie'
      this.saveMovieParam.status.total = null
      this.saveService.stop()
        .then(blob => {
          return this.saveService.post(blob)
            .progress(msg => {
              this.saveMovieParam.status.message += '\n' + msg
            })
            .then(blob => this.saveService.save(blob))
            .then(() => {
              this.saveMovieParam.converting = false
              this.modalType = null
            })
        })
        .catch(e => {
          console.error(e)
        })
      this.options.time.value = this._temporaryStep
    },
    saveMovieCancel() {
      if( this.saveMovieParam.saving||this.saveMovieParam.converting ) {
        this.saveMovieParam.saving = false
        this.saveMovieParam.converting = false

        this.saveService.cancel()

        this.options.time.value = this._temporaryStep
        this.modalType = null
      }
    },
    initCameraSettings() {
      this.$set(this,'cameraSettings',this.getStorage('camera')||[])
    },
    saveCameraSetting(name) {
      this.cameraSettings.push({
        name,
        camera: toPlain(this.layout.scene.camera),
      })
      this.saveStorage('camera',this.cameraSettings)
    },
    loadCameraSetting(name) {
      this.$set(this.layout.scene,'camera', this.cameraSettings.find(d => d.name === name ).camera)
    },
    removeCameraSetting(name) {
      let n = this.cameraSettings.findIndex(d => d.name === name )
      this.cameraSettings.splice(n,1)
      this.saveStorage('camera',this.cameraSettings)
    },

    saveStorage(name,value) {
      if( this.hasStorage ) {
        window.localStorage.setItem(name,JSON.stringify(value))
      }
    },
    getStorage(name) {
      if( this.hasStorage ) {
        return JSON.parse(window.localStorage.getItem(name))
      }
    },
    removeStorage(name) {
      if( this.hasStorage ) {
        return window.localStorage.removeItem(name)
      }
    },
  },
}
