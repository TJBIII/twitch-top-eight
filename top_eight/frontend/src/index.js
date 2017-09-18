(() => {
    require('./modules/views//index.js', {mode: (base, files) => {
        return files.map(module => {
            return `require('${module}');`;
        }).join(' ');
    }});
})();
