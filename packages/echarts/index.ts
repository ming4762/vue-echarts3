import { App, Plugin } from 'vue'

import Echarts from './src/Echarts'

Echarts.install = (app: App) => {
  app.component(Echarts.name, Echarts)
  return app
}

export default Echarts as typeof Echarts & Plugin
