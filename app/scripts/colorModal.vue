<template>
  <div>
    <sketch-picker
      v-model="value"
      :preset-colors="presetColors"
      :disable-alpha="false"
      ></sketch-picker>
  </div>
</template>

<script>
import { Sketch } from 'vue-color'

export default {
  props: [
    'value',
    'name',
  ],
  data() {
    return {
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
    }
  },
  components: {
    SketchPicker: Sketch,
  },
}
