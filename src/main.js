import Vue from 'vue';

import 'normalize.css/normalize.css';

import Element from 'element-ui';
import locale from 'element-ui/lib/locale/lang/en';
import './styles/element-variables.scss';

import '@/styles/index.scss';

import App from './App';
import store from './store';
import router from './router';

import './icons';
import './permission';

import * as filters from './filters';

Vue.use(Element, { size: 'medium', locale })

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
