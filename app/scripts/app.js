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
import blockReader from './blockReader.js'
import getMimetype from './getMimetype.js'
import concatData from './concatData.js'
import timerAsync from './timerAsync.js'

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
      plotData: [],
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

        startStep: null,
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
        time: {
          value: 0,
          max: 0,
        },
        fps: 2,
        shadeMarker: false,
      },
      maxColumns: Infinity,
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

      loadedDataChangeTime: 0,
      plotDataChangeTime: 0,
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
    columns() {
      return {
        id: this.options.idColumn,
        x: this.options.columns.x,
        y: this.options.columns.y,
        z: this.options.columns.z,
        value: this.options.columns.v,
      }
    },
    idColumn() {
      return ( this.columns.id!=null && this.columns.id > -1 && this.columns.id < this.maxColumns ) ?
        this.columns.id : -1
    }
  },
  watch: {
    loadedDataChangeTime: {
      handler() {
        this.options.time.max = this.loadedData.length-1

        'xyzv'.split('').forEach(d => {
          this.options.columns[d] = Math.min(this.options.columns[d],this.maxColumns)
        })

        this.setStep()
      },
    },
    plotDataChangeTime: {
      handler() {
        if( this.plotData.length ) {
console.log('plotDataChangeTime')
//          this.options.maxColumns = Math.min.apply(null,this.data.map(d=>d.length-1))
          this.maxColumns = this._loadedData.map(x=>x.length-1).reduce((a,b)=>Math.min(a,b),Infinity)

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
      this.changePlotData('x')
      this.setTraces()
      this.update()
      this.getCoordRange('x')
    },
    'options.columns.y'() {
      this.changePlotData('y')
      this.setTraces()
      this.update()
      this.getCoordRange('y')
    },
    'options.columns.z'() {
      this.changePlotData('z')
      this.setTraces()
      this.update()
      this.getCoordRange('z')
    },
    'options.columns.v'() {
      this.changePlotData('value')
      this.setTraces()
      this.update()
      this.setValueRange()
    },
    'layout.scene.aspectmode'(mode) {
console.log('scene.aspectmode')
      this.relayout('scene.aspectmode',mode)
    },
    'layout.scene.aspectratio.x': {
      handler(d) {
console.log('scene.aspectratio.x')
        this.relayout('scene.aspectratio.x',d)
      },
      deep: true,
    },
    'layout.scene.aspectratio.y': {
      handler(d) {
console.log('scene.aspectratio.y')
        this.relayout('scene.aspectratio.y',d)
      },
      deep: true,
    },
    'layout.scene.aspectratio.z': {
      handler(d) {
console.log('scene.aspectratio.z')
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
    'layout.scene.camera': {
      handler(camera) {
        if( this.container &&
          this.container._fullLayout &&
          this.container._fullLayout.scene &&
          this.container._fullLayout.scene.camera ) {
          let org = this.container._fullLayout.scene.camera
          if( camera.center.x!=org.center.x ||
            camera.center.y!=org.center.y ||
            camera.center.z!=org.center.z ||
            camera.eye.x!=org.eye.x ||
            camera.eye.y!=org.eye.y ||
            camera.eye.z!=org.eye.z ||
            camera.up.x!=org.up.x ||
            camera.up.y!=org.up.y ||
            camera.up.z!=org.up.z ) {
            this.relayout({
              'scene.camera': camera,
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
        if( !this.options.shadeMarker ) {
          let markers = this.container.data.map(d=>d.marker)
          let nums = markers.map((d,i)=>d.color!==this.colors[i]?i:false).filter(d=>d!==false)
          this.restyle({
            'marker.color': nums.map(i=>this.colors[i]),
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
    this.init().then(() => {
      this.setCameraWatches()
    })
  },
  methods: {
    init() {
      this._restyleQue = []
      this.hasStorage = !!window.localStorage
      this.initCameraSettings()

      return this.ready = import(
        /* webpackChunkName: 'Plotly' */
//        'ify-loader!@/plotly.js/dist/plotly-gl3d'
//        'ify-loader!plotly.js/dist/plotly'
//        'ify-loader!plotly.js/dist/plotly.min.js'
        'ify-loader!./vendors/plotly.js/dist/plotly-scatter3d'
      ).then(({default: Plotly}) => {
window.Plotly=Plotly
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
    restyle(opt,index) {
      let num = 0
      if( opt ) {
        num = this._restyleQue.findIndex(d => JSON.stringify(d.index)==JSON.stringify(index))
        num = num==-1 ? this._restyleQue.length : num
      }

      this._restyleQue[num] = {
        option: {
          ...((this._restyleQue[num]||{}).option||{}),
          ...(opt||{}),
        },
        index,
      }

      if( !this._restyling ) {
        this._restyling = true
        let queue = this._restyleQue.splice(num,1)[0]
console.log('restyle')
console.time('restyle')
        this.Plotly.restyle('canvas',queue.option,queue.index).then(() => {
console.timeEnd('restyle')
          this._restyling = false
          if( this._restyleQue.length ) {
            this.restyle()
          }
        })
      }

    },
    relayout(...opt) {
console.log('relayout')
console.time('relayout')
      this.Plotly.relayout('canvas',...opt).then(() => {
console.timeEnd('relayout')
      })
    },
    update() {
console.log('update')
console.time('update')
      let df = this.Plotly.redraw('canvas')
      df.then(() => {
        this.$set(this,'colors',this.container.data.map(d=>d.marker.color))
        this.setValueRange()
        'xyz'.split('').forEach(x => this.getCoordRange(x))
console.timeEnd('update')
      })
      return df
    },
    getId(d) {
      let n = ( this.columns.id!=null && this.columns.id > -1 && this.columns.id < maxColumns ) ?
        this.columns.id : -1
      return d[n]
    },
    setPlotData() {
console.log('setPlotData')
console.time('setPlotData')
      let array = this._loadedData = this.reshapeStepData(this.loadedData[this.options.time.value||0] || [])
      this.plotData = {}
      array.forEach(d => {
        let id = this.idColumn==-1 ? -1 : d[this.idColumn]
        if( this.plotData[id]==null ) {
          this.plotData[id] = {
            x: [],
            y: [],
            z: [],
            value: [],
          }
        }
        this.plotData[id].x.push(d[this.columns.x])
        this.plotData[id].y.push(d[this.columns.y])
        this.plotData[id].z.push(d[this.columns.z])
        this.plotData[id].value.push(d[this.columns.value])
      })
      this.plotDataChangeTime = Date.now()
console.timeEnd('setPlotData')
    },
    changePlotData(name) {
console.log('changePlotData')
console.time('changePlotData')
      let array = this._loadedData
      Object.keys(this.plotData).forEach(id => {
        this.plotData[id][name] = []
      })
      array.forEach(d=> {
        let id = this.idColumn==-1 ? -1 : d[this.idColumn]
        this.plotData[id][name].push(d[this.columns[name]])
      })
console.timeEnd('changePlotData')
    },
    setStep() {
console.log('setStep')
console.time('setStep')
      return Promise.all([
        timerAsync(1000/this.options.fps),
        new Promise((resolve,reject) => {
          this.setPlotData()
          if( Object.keys(this.plotData).length ) {
            this.setTraces()

console.log(this.options.fps)
            this.update().then(() => {
              this.initialized = true
console.timeEnd('setStep')
              resolve()
            })
          } else {
            reject()
          }
        }),
      ])
    },
    setTimeStep(t) {
console.log('setTimeStep')
console.time('setTimeStep')
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
console.timeEnd('setTimeStep')
    },
    setTraces() {
console.log('setTraces')
console.time('setTraces')
      let traces = this.container.data
      let ids = Object.keys(this.plotData)
      ids.forEach(id => {
        let num = traces.findIndex(d=>d.id===id)
        let trace = traces[num]
        if( trace==null ) {
          num = traces.length
          traces.push(trace = {
            id: id,
            name: `id:${id}`,
            type: 'scatter3dpoint',
            x: [],
            y: [],
            z: [],
            mode: 'markers',
//            marker: clone(this.style.marker),
            marker: toPlain(this.style.marker),
          })
        }
        let data = this.plotData[id]
        trace.x = data.x
        trace.y = data.y
        trace.z = data.z
        trace.marker.color = this.options.shadeMarker ?  data.value : this.colors[num]
      })
      if( traces.length ) {
        traces[0].marker.showscale = this.options.shadeMarker
      }
console.timeEnd('setTraces')
    },
    setTraceColor() {
console.log('setTraceColor')
console.time('setTraceColor')
      this.container.data.forEach(trace => {
        trace.marker.color = this.options.shadeMarker ?
          this.plotData[trace.id].value : null
      })
console.timeEnd('setTraceColor')
      return this.update()
    },
    setValueRange() {
console.log('setValueRange')
console.time('setValueRange')
      if( this.style.marker.cauto ) {
        let cmin = Infinity
        let cmax = -Infinity
        Object.keys(this.plotData).forEach(id => {
          this.plotData[id].value.forEach(v => {
            if( isNumber(v) ) {
              cmin = Math.min(v,cmin)
              cmax = Math.max(v,cmax)
            }
          })
        })
        if( cmin != Infinity ) {
          this.style.marker.cmin = cmin
        }
        if( cmax != -Infinity ) {
          this.style.marker.cmax = cmax
        }
/*
        this.restyle({
          'marker.cmin': this.style.marker.cmin,
          'marker.cmax': this.style.marker.cmax,
        })
*/
      }
console.timeEnd('setValueRange')
    },
    getCoordRange(x) {
console.log('getCoordRange')
console.time('getCoordRange')
      if( this.layout.scene[`${x}axis`].autorange && this.container._fullLayout.scene ) {
        this.layout.scene[`${x}axis`].range = this.container._fullLayout.scene[x+'axis'].range
      }
console.timeEnd('getCoordRange')
    },
    setAxisAuto(x,auto) {
console.log('setAxisAuto')
console.time('setAxisAuto')
      if( this.container._fullLayout.scene ) {
console.log('scene.'+x+'axis.autorange')
        this.relayout({
          [`scene.${x}axis.autorange`]: auto,
        })
        if( auto ) {
          this.getCoordRange(x)
        } else {
console.log('scene.'+x+'axis.range')
          this.relayout({
            [`scene.${x}axis.range`]: this.layout.scene[`${x}axis`].range,
          })
        }
      }
console.timeEnd('setAxisAuto')
    },
    setAxisRange(x,range) {
console.log('setAxisRange')
console.time('setAxisRange')
      if( this.container && this.container._fullLayout.scene ) {
        if( !this.layout.scene[`${x}axis`].autorange ) {
console.log('scene.'+x+'axis.range')
          this.relayout({
            [`scene.${x}axis.range`]: range,
          })
        }
      }
console.timeEnd('setAxisRange')
    },
    setDatafile(file) {
console.log('setDatafile')
console.time('setDatafile')
      this.$refs.upload.clearFiles()
      this.loadingState.run = true

console.time('load')
      blockReader(0,150,file.raw,e => {
        let isBinary
        if( e.target.error==null ) {
          let mimetype = getMimetype(e.target.result)
          isBinary = mimetype != 'text/plain'
        } else {
          console.log('read error:'+e.target.error)
        }
        let results = isBinary ? new ArrayBuffer() : []

        getFileData(file.raw,null,isBinary).progress(res=>{
          this.loadingState.percentage = res.percentage

//          results.push(res.value)
          results = isBinary ? concatData(results,res.value,isBinary) : [...results, res.value]
          /*
          let tmp = res.value.split('\n')
          lines[lines.length-1] += tmp[0]
          if( tmp.length>1 ) {
            lines = lines.concat(tmp.slice(1))
          }
          */

        }).then(res=>{
console.timeEnd('load')
          this.loadingState.status = 'success'
          this.loadingState.percentage = 100
          this.$nextTick(() => {
            this.loadedData = this.reshapeData(results,isBinary)
            setTimeout(() => {
              this.loadedDataChangeTime = Date.now()
              this.$nextTick(() => {
                this.loadingState.run = false
                this.loadingState.status = null
                this.loadingState.percentage = 0
console.timeEnd('setDatafile')
              })
            },100)
          })
        })
      },true)
    },
    reshapeData(results,binaryFlag) {
console.log('reshape')
console.time('reshape')
      if( !binaryFlag ) {
        let lines = results.reduce((lines,value) => {
          let x = value.split('\n')
          return [
            ...lines.slice(0,-1),
            lines.slice(-1)[0]+x[0],
            ...x.slice(1),
          ]
        },['']).filter(d=>d&&d!='')

        console.log('text lines :',lines.length)
        let l = 0
        let times = []
        let num = Number(lines[l])
        while( l+num <= lines.length ) {
          times.push(lines.slice(l+2,l+2+num))
          l += num + 2
          num = Number(lines[l]||0)
        }
        console.log('time steps :',times.length)
console.timeEnd('reshape')
        return times
      } else {
console.log(results)
      }
    },
    /**
    reshapeData(lines) {
      lines = lines.slice(0,-1)
      let n = 0
      console.log('text lines :',lines.length)

      let l = 0
      let times = []
      let num = Number(lines[l])
      while( l+num < lines.length ) {
        times.push(lines.slice(l+2,l+2+num))
        l += num + 2
        num = Number(lines[l]||0)
      }
      console.log('time steps :',times.length)
      return times
    },
    */
    reshapeStepData(data) {
console.log('reshapeStepData')
console.time('reshapeStepData')
      let res = []
      for( let i=0; i < data.length; i++ ) {
        res[i] = data[i].replace(/[ \t]+$/,'').split(/[ \t]+/).map(d=>Number(d))
      }
console.timeEnd('reshapeStepData')
      return res

//      return times.map(lines => lines.map(line => line.replace(/[ \t]+$/,'').split(/[ \t]+/).map(d=>Number(d))))
    },
    clearUploadFile() {
console.log('clearUploadFile')
console.time('clearUploadFile')
console.timeEnd('clearUploadFile')
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
console.log('updateColor')
console.time('updateColor')
      let num = this.container._fullData.findIndex(d=>d.name===this.colorParam.name)
      this.$set(this.colors,num,this.colorParam.color)
      this.modalType = null
console.timeEnd('updateColor')
    },
    openSaveImageModal() {
      this.modalType = 'saveImage'
    },
    openSaveMovieModal() {
      if( this.saveMovieParam.startStep == null ) {
        this.saveMovieParam.startStep = 0
      }
      if( this.saveMovieParam.endStep == null ) {
        this.saveMovieParam.endStep = this.options.time.max - 1
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

      let filename = this.saveMovieParam.filename + '.' + this.saveMovieFormats[this.saveMovieParam.format].ext

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
      this.$set(this.layout.scene.camera,'up', this.cameraSettings.find(d => d.name === name ).camera.up)
      this.$set(this.layout.scene.camera,'center', this.cameraSettings.find(d => d.name === name ).camera.center)
      this.$set(this.layout.scene.camera,'eye', this.cameraSettings.find(d => d.name === name ).camera.eye)
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
