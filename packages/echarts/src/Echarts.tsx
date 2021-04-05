import { defineComponent, PropType, ref, computed, toRefs } from 'vue'

import * as echarts from 'echarts'

import { InitOption } from '../../../typings'

/**
 * 创建UUID
 */
const createUuid = (): string => {
  const s: Array<any> = []
  const hexDigits = '0123456789abcdef'
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4'
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
  s[8] = s[13] = s[18] = s[23] = '-'

  return s.join('')
}

/**
 * 判断charts是否有数据
 */
const hasData = (manualOptions: any, options: any): boolean => {
  // 获取数据
  const option = manualOptions || options
  if (!option) {
    return false
  }
  if (!option.series || option.series.length === 0) {
    return false
  }
  let result = false
  for (const item of option.series) {
    if (item.data && item.data.length > 0) {
      result = true
      break
    }
  }
  return result
}

/**
 * 创建表格
 */
const createChart = (id: string): echarts.ECharts => {
  // 创建表格队形
  const chart = echarts.init(document.getElementById(id) as HTMLElement)
  chart.setOption({
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
  })
  return chart
}

/**
 * 获取div高度
 * @param initOptions
 */
const getDivStyle = (initOptions: InitOption | null): string => {
  if (!initOptions || !initOptions.height) {
    return 'height: 100%;'
  }
  return `height:${initOptions.height};`
}

/**
 * arcgis3
 */
export default defineComponent({
  name: 'vue-echarts3',
  props: {
    id: {
      type: String as PropType<string>,
      required: false,
      default: createUuid()
    },
    initOptions: {
      type: Object as PropType<InitOption>,
      required: true
    },
    theme: {
      type: [String, Object]
    },
    options: {
      type: Object
    }
  },
  setup (props) {
    const { options, initOptions } = toRefs(props)
    const manualOptions = ref(null)
    // 是否有数据计算属性
    const getHasData = computed(() => hasData(manualOptions.value, options ? options.value : null))
    const computedDivStyle = computed(() => getDivStyle(initOptions ? initOptions.value : null))
    return {
      manualOptions,
      getHasData,
      computedDivStyle
    }
  },
  data () {
    const chart: any = null
    return {
      chart
    }
  },
  mounted () {
    // 初始化表格
    if (this.options) {
      this.chart = createChart(this.id)
    }
  },
  methods: {
    /**
     * 获取el面积
     */
    getArea () {
      return this.$el.offsetWidth * this.$el.offsetHeight
    }
  },
  render () {
    return (
      <div style={this.computedDivStyle} id={this.id}/>
    )
  }
})
