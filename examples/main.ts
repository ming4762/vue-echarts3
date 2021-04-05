import { createApp } from 'vue'
import App from './App.vue'

import Echarts from '../src'

const app = createApp(App)
app.use(Echarts)

app.mount('#app')
