import Vue from 'vue'

import './styles/base.css'

import App from './scripts/app.vue'
import store from './scripts/store.js'

import './scripts/element-ui.js'

if ('serviceWorker' in navigator) {
}
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  })
}

new Vue({
  el: document.querySelector('.app'),
  template: '<app></app>',
  components: {
    App,
  },
  store,
})
