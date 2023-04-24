import { complieToFunction } from "./compiler/index";
import { initState } from "./state";

export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this;
        vm.$options = options;

        initState(vm)

        if (options.el) {
            // 实现数据的挂载
            vm.$mount(options.el)
        }
    }
    Vue.prototype.$mount = function (el) {
        const vm = this;
        let ops = vm.$options
        el = document.querySelector(el);
        // 先查找有没有render函数
        if (!ops.render) {
            // 没有render看一下是否写了template，没写template就采用外部的template
            let template;
            // 没有写模板 但是写了el
            if (!ops.template && el) {
                template = el.outerHTML
            } else {
                // 如果有el，则采用模板中的内容
                if (el) {
                    template = ops.template
                }
            }
            // 写了template 就用写了的template
            if(template){
                // 这里需要对模板进行编译,最终会编译成h('xxx')
                const render = complieToFunction(template);
                ops.render = render;
            }
        }
        ops.render;
        // script 标签引用的vue.global.js 这个编译过程是在浏览器运行的
        // runtime 是不包含模板编译的，整个编译时打包的时候通过loader来转义.vue文件的，用runtime的时候不能使用模板
    }
}