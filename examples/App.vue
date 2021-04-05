<template>
  <div style="height: 500px; width: 800px; background: white">
    <vue-echarts3 :dblclick="handleClick" :options="options" ref="vueEcharts"/>
    <button @click="handleTest">测试</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
  data () {
    return {
      options: {
        title: {
          text: 'ECharts 入门示例'
        },
        tooltip: {},
        xAxis: {
          data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
        },
        yAxis: {},
        series: [{
          name: '销量',
          type: 'bar',
          data: [5, 20, 36, 10, 10, 20]
        }]
      }
    }
  },
  methods: {
    handleTest () {
      this.options.title.text = 'ECharts 入门示例2'
      this.options.series[0].data[0] = 10
    },
    handleClick (params: any) {
      console.log(params)
    }
  },
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
