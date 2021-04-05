import { defineComponent, PropType, ref, computed, toRefs } from 'vue'

import { addListener, removeListener } from 'resize-detector'
import { debounce } from 'lodash'

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
 * echarts事件
 */
const EVENTS = [
  'dblclick',
  'legendselectchanged',
  'legendselected',
  'legendunselected',
  'legendscroll',
  'datazoom',
  'datarangeselected',
  'timelinechanged',
  'timelineplaychanged',
  'restore',
  'dataviewchanged',
  'magictypechanged',
  'geoselectchanged',
  'geoselected',
  'geounselected',
  'pieselectchanged',
  'pieselected',
  'pieunselected',
  'mapselectchanged',
  'mapselected',
  'mapunselected',
  'axisareaselected',
  'focusnodeadjacency',
  'unfocusnodeadjacency',
  'brush',
  'brushselected',
  'rendered',
  'finished',
  'click',
  'mouseover',
  'mouseout',
  'mousemove',
  'mousedown',
  'mouseup',
  'globalout',
  'contextmenu'
]

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
      type: Object as PropType<InitOption>
    },
    // 当前 ECharts 实例使用的主题
    theme: {
      type: [String, Object] as PropType<string>
    },
    options: {
      type: Object
    },
    // 实例的分组，会自动绑定到 ECharts 组件的同名属性上
    group: {
      type: String as PropType<string>
    },
    // 是否浅监控属性变化
    watchShallow: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    // 在性能敏感（数据量很大）的场景下，我们最好对于 options prop 绕过 Vue 的响应式系统。当将 manual-update prop 指定为 true 且不传入 options prop 时，数据将不会被监听。然后，你需要用 ref 获取组件实例以后手动调用 mergeOptions 方法来更新图表
    manualUpdate: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    // 指定 ECharts 实例在组件根元素尺寸变化时是否需要自动进行重绘
    autoresize: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  setup (props) {
    const { options, initOptions } = toRefs(props)
    const manualOptions = ref(null)
    // 是否有数据计算属性
    const getHasData = computed(() => hasData(manualOptions.value, options ? options.value : null))
    // 计算表格高度
    const computedDivStyle = computed(() => getDivStyle(initOptions && initOptions.value ? initOptions.value : null))
    return {
      manualOptions,
      getHasData,
      computedDivStyle
    }
  },
  data () {
    const chart: any = null
    return {
      chart,
      lastArea: 0,
      resizeHandler: null as any,
      // 没有数据的配置
      noDataOption: {
        title: {
          text: '暂无数据',
          x: 'center',
          borderColor: '#ccc',
          top: '40%',
          textStyle: {
            color: '#888',
            fontStyle: 'normal',
            fontWeight: 'normal',
            fontFamily: 'sans-serif',
            fontSize: 28
          }
        }
      }
    }
  },
  created () {
    if (!this.manualUpdate) {
      // 延迟加载不监控options变化
      this.$watch('options', (_new: any, old: any) => {
        if (!this.chart && _new) {
          this.init()
        } else {
          this.chart.setOption(_new, _new !== old)
        }
      }, { deep: !this.watchShallow })
    }
    const watched = ['theme', 'initOptions', 'autoresize', 'manualUpdate', 'watchShallow']
    watched.forEach(prop => {
      this.$watch(prop, () => {
        this.refresh()
      }, { deep: true })
    })
  },
  mounted () {
    // 初始化表格
    if (this.options) {
      this.init()
    }
  },
  /**
   * 页面激活执行
   */
  activated () {
    if (this.autoresize) {
      this.chart && this.chart.resize()
    }
  },
  /**
   * 销毁页面前销毁chart
   */
  beforeUnmount () {
    if (this.chart) {
      this.destroy()
    }
  },
  methods: {
    /**
     * 获取el面积
     */
    getArea () {
      return this.$el.offsetWidth * this.$el.offsetHeight
    },
    /**
     * 初始化函数
     */
    init () {
      if (!this.chart && this.getHasData) {
        const chart = echarts.init(this.$el, this.theme, this.initOptions)
        // 绑定分组
        if (this.group) {
          chart.group = this.group
        }
        chart.setOption(this.manualOptions || this.options || {}, true)
        // 绑定事件
        EVENTS.forEach(event => {
          const handler = this.$attrs[event]
          if (handler) {
            if (typeof handler === 'function') {
              chart.on(event, params => {
                handler.call(this, params)
              })
            } else {
              console.warn(`event is not function, event name: ${event}`)
            }
          }
        })
        // 绑定autoresize
        if (this.autoresize) {
          this.lastArea = this.getArea()
          this.resizeHandler = debounce(() => {
            if (this.lastArea === 0) {
              this.mergeOptions({}, true)
              this.resize()
              // this.mergeOptions(this.getOption || {}, true)
              this.mergeOptions(this.options || this.manualOptions || {}, true)
            } else {
              this.resize()
            }
            this.lastArea = this.getArea()
          }, 100, { leading: true })
          addListener(this.$el, this.resizeHandler)
        }
        this.chart = chart
      }
    },
    // 刷新echart
    refresh: function () {
      if (this.chart) {
        this.destroy()
        this.init()
      }
    },
    // 销毁charts
    destroy: function () {
      if (this.autoresize) {
        // 移除事件
        removeListener(this.$el, this.resizeHandler)
      }
      this.dispose()
      this.chart = null
    },
    dispose: function () {
      this.delegateMethod('dispose')
    },
    /**
     * 执行echart方法
     */
    delegateMethod: function (name: string, ...args: Array<any>) {
      if (!this.chart) {
        this.init()
      }
      return this.chart[name](...args)
    },
    // 执行echart方法resize
    resize: function (options?: any) {
      this.delegateMethod('resize', options)
    },
    // 执行echart方法appendData
    appendData: function (params: any) {
      this.delegateMethod('appendData', params)
    },
    // 执行echart方法dispatchAction
    dispatchAction: function (payload: any) {
      this.delegateMethod('dispatchAction', payload)
    },
    // 执行echart方法convertToPixel
    convertToPixel: function (finder: any, value: any) {
      this.delegateMethod('convertToPixel', finder, value)
    },
    // 执行echart方法convertFromPixel
    convertFromPixel: function (finder: any, value: any) {
      this.delegateMethod('convertFromPixel', finder, value)
    },
    // 执行echart方法containPixel
    containPixel: function (finder: any, value: any) {
      this.delegateMethod('containPixel', finder, value)
    },
    // 执行echart方法showLoading
    showLoading: function (type: string, options: any) {
      this.delegateMethod('showLoading', type, options)
    },
    // 执行echart方法hideLoading
    hideLoading: function () {
      this.delegateMethod('hideLoading')
    },
    // 执行echart方法appendData
    getDataURL: function (options: any) {
      this.delegateMethod('getDataURL', options)
    },
    // 执行echart方法appendData
    getConnectedDataURL: function (options: any) {
      this.delegateMethod('getConnectedDataURL', options)
    },
    clear: function () {
      this.delegateMethod('clear')
    },
    // 合并参数
    mergeOptions: function (options: any, notMerge: boolean, lazyUpdate?: boolean) {
      if (this.manualUpdate) {
        this.manualOptions = options
      }
      if (!this.chart) {
        this.init()
      } else {
        this.delegateMethod('setOption', options, notMerge, lazyUpdate)
      }
    }
  },
  render () {
    return (
      <div style={this.computedDivStyle} id={this.id}/>
    )
  }
})
