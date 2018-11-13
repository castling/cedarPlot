<template>
  <div class="colorbar">
    <svg class="svg">
      <defs>
        <linearGradient :id="`gradient-${name}`" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop v-for="(color,i) in colors" :key="i"
            :offset="percentage(color[0])" :stop-color="color[1]"/>
        </linearGradient>
      </defs>
      <rect class="rect" :fill="`url(#gradient-${name})`" x="0" y="0" width="100%" height="100%"/>
    </svg>
  </div>
</template>

<style scoped lang="scss">
  .colorbar {
    position: relative;
    .svg {
      position: absolute;
      width: 100%;
      height: 100%;
    }
  }
</style>

<script>
//let tinycolor = require('tinycolor2')

export default {
  props: [
    'colors',
    'name',
  ],
  mounted() {
//    this.svg = this.$el.querySelector('.svg')
  },
  methods: {
    percentage(v) {
      return Math.round(v*100) + '%'
    },
  },
}
</script>
