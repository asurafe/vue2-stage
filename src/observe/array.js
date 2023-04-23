// 我们希望重写数组中的部分方法

let oldArrayProto = Array.prototype;

export let newArrayProto = Object.create(oldArrayProto);

// 修改原数组的方法
let methods = [
    'pop', 'push', 'shift', 'unshift', 'splice', 'reserve', 'sort'
]
// concat slice 都不会改变原数组
methods.forEach(method => {
    newArrayProto[method] = function (...args) {
        const result = oldArrayProto[method].call(this, ...args)

        let inserted;
        let ob = this.__ob__
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2);
            default:
                break;

        }
        if(inserted){
            // 对新增的内容再次进行检测
            ob.observeArray(inserted)
        }
        return result
    }
})