<template>
  <div class="slide-controller"
    :class="mode"
    @click="show=!show"
    @mouseenter="hovering=true"
    @mouseleave="hovering=false"
    >
    <i class="slide-controller__icon"
      :class="[iconStyle, {hovering:hovering}]"
    ></i>
    <span class="slide-controller__label"
      :class="{hovering:hovering}"
      >{{show ? 'Close' : 'Expand' }}
    </span>
  </div>
</template>

<style scoped lang="scss">
  .slide-controller  {
    background-color: #fff;
    color: #d3dce6;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    &.horizontal {
      border-top: 1px solid #eaeefb;
      border-bottom: 1px solid #eaeefb;
      height: 30px;
      width: 100%;
      flex-direction: row;
    }
    &.vertical {
      border-left: 1px solid #eaeefb;
      border-right: 1px solid #eaeefb;
      height: 100%;
      width: 30px;
      flex-direction: column;
    }

    &__icon {
      transition: .3s ease-in-out;
      line-height: 44px;
      font-size: 16px;
      &.hovering {
        color: #409eff;
      }
    }

    &.horizontal .slide-controller__icon.hovering  {
      transform: translateX(-40px)
    }
    &.vertical .slide-controller__icon.hovering  {
      transform: translateY(-40px)
    }

    &__label {
      position: absolute;
      font-size: 14px;
      line-height: 44px;
      transition: .3s ease-in-out;
      opacity: 0;
      display: inline-block;
      &.hovering {
        color: #409eff;
        opacity: 1;
      }
    }

    &.horizontal .slide-controller__label {
      transform: translateX(40px);
      &.hovering  {
        transform: translateX(0px);
      }
    }
    &.vertical .slide-controller__label {
      transform: translateY(40px) rotate(90deg);
      &.hovering  {
        transform: translateY(0px) rotate(90deg);
      }
    }

  }
</style>

<script>
export default {
  props: {
    'value': Boolean,
    'mode': {
      type: String,
      default: 'horizontal',
    },
  },
  data() {
    return {
      show: false,
      hovering: false,
    }
  },
  computed: {
    iconStyle() {
      return this.mode==='horizontal' ?
        ( this.show ? 'el-icon-caret-top' : 'el-icon-caret-bottom' ) :
        ( this.show ? 'el-icon-caret-left' : 'el-icon-caret-right' )
    },
  },
  watch: {
    value: {
      handler() {
        this.show = this.value
      },
      immediate: true,
    },
    show: {
      handler() {
        if( this.show !== this.value ) {
          this.$emit('input',this.show)
        }
      },
    },
  },
}
</script>
