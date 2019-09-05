<template>
  <div class="modal">
    <div class="modal__header">
      {{ param.converting ? 'CONVERTING MOVIE' : ( param.saving ? param.status.state : 'SAVE AS MOVIE' )}}
    </div>
    <div class="modal__body">
      <el-form v-if="!(param.saving||param.converting)" :model="param" :rules="rules" label-width="150px" >
        <el-form-item label="file name">
          <el-input v-model="param.filename"></el-input>
        </el-form-item>
        <el-form-item label="start step">
          <el-input-number v-model="param.startStep" :controls="false"
            :min="0" :max="param.endStep-1"></el-input-number>
        </el-form-item>
        <el-form-item label="end step">
          <el-input-number v-model="param.endStep" :controls="false"
            :min="param.startStep+1" :max="maxStep"></el-input-number>
        </el-form-item>
        <el-form-item label="movie width">
          <el-input-number v-model="param.width" :controls="false" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="movie height">
          <el-input-number v-model="param.height" :controls="false" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="movie type">
          <el-select v-model="param.format">
            <el-option v-for="(format,key) in formats" :key="key"
              :label="format.name" :value="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="frame rate">
          <el-input-number v-model="param.framerate" :controls="false" :min="0"
            :disabled="!formats[param.format].framerate"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="movie quality">
          <el-input-number v-model="param.quality" :controls="false" :min="0" :max="100"
            :disabled="!formats[param.format].quality"
            ></el-input-number>
        </el-form-item>
      </el-form>
      <el-input type="textarea" :readonly="true"
        v-else-if="param.converting"
        :autosize="{minRows:5, maxRows:10}"
        v-model="param.status.message">
      </el-input>
      <div class="progressbar" v-else>
        <el-progress :text-inside="true" :stroke-width="18"
          :percentage="percentage">
        </el-progress>
      </div>
    </div>
    <div class="modal__footer">
      <el-button type="primary" v-if="!(param.saving||param.converting)"
        @click="$emit('save')">SAVE</el-button>
      <el-button @click="$emit('cancel')">CANCEL</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .modal {
    background-color: white;
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    &__header {
      border-bottom: 1px solid rgba(0,0,0,0.2);
      padding: 5px;
    }
    &__body {
      display: flex;
      justify-content: center;
      padding: 10px 0;
    }
    &__footer {
      border-top: 1px solid rgba(0,0,0,0.2);
      padding: 5px;
      display: flex;
      justify-content: flex-end;
    }
    .el-form .el-form-item {
      margin-bottom: 0.5rem;
      .el-input-number {
        width: 100%;
      }
    }
    .progressbar,
    .el-textarea {
      width: 100%;
      min-width: 40vw;
    }
  }
</style>

<script>
/*
import ElButton from 'element-ui/lib/button.js'
import ElInput from 'element-ui/lib/input.js'
import ElInputNumber from 'element-ui/lib/input-number.js'
import ElForm from 'element-ui/lib/form.js'
import ElFormItem from 'element-ui/lib/form-item.js'
import ElSelect from 'element-ui/lib/select.js'
import ElOption from 'element-ui/lib/option.js'
import ElProgress from 'element-ui/lib/progress.js'
*/

export default {
  components: {
    /*
    ElButton,
    ElInput,
    ElInputNumber,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
    ElProgress,
    */
  },
  props: [
    'param',
    'maxStep',
    'formats',
  ],
  computed: {
    percentage() {
      if( this.param.status.total ) {
        return Math.round( this.param.status.step / this.param.status.total * 100 )
      }
      return 0
    },
  },
  watch: {
    'param.status.message'(msg) {
      if( this.param.converting ) {
        let el = this.$el.querySelector('.el-textarea textarea')
        if( el ) {
          el.scrollTo(0,el.scrollHeight)
        }
      }
    },
  },
  data() {
    return {
      rules: {
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
        quality: [
          { required: true, message: 'Please input valid number', trigger: 'change' },
          { type: 'number', message: 'Please input valid number', trigger: 'change' },
        ],
        framerate: [
          { required: true, message: 'Please input valid number', trigger: 'change' },
          { type: 'number', message: 'Please input valid number', trigger: 'change' },
        ],
      },
    }
  },
}
</script>
