const Vue = require('vue');

if (process.env.NODE_ENV === 'production') {
    Vue.config.devtools = false;
    Vue.config.debug = false;
    Vue.config.productionTip = false;
    Vue.config.silent = true;
}

const { VueSimpleSpinner } = require('vue-simple-spinner');
Vue.component('simple-spinner', VueSimpleSpinner);

const Sortable = require('sortablejs');
Vue.directive('sortable', {
    inserted: function (el, binding) {
        console.log('el', el);
        let sortable = Sortable.create(el, binding.value || {});
    }
});

document.addEventListener("DOMContentLoaded", function(event) {
    if (document.getElementById('viewerApp')) {
        const ViewerApp = require('./viewerApp.vue');
        
        const viewerApp = new Vue({
            el: '#viewerApp',
            render: h => h(ViewerApp),
        });
    }

    if (document.getElementById('configApp')) {
        const ConfigApp = require('./configApp.vue');

        const configApp = new Vue({
            el: '#configApp',
            render: h => h(ConfigApp)
        });
    }
});
