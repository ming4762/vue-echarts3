<template>
  <div style="height: 500px; width: 800px; background: white">
    <vue-echarts3 :options="{}" ref="vueEcharts"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
  mounted () {
    console.log(this.$refs.vueEcharts)
  }
})
</script>

<style>
  html, body {
    height: 100%;
  }
  body {
    background: aliceblue;
  }
</style>
