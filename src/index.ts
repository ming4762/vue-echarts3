import { App } from 'vue'

import Echarts from '../packages/echarts'

const components = [
  Echarts
]

const install = (app: App): App => {
  components.forEach(component => {
    app.use(component)
  })
  return app
}

export {
  Echarts
}

export default {
  install
}
