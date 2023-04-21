class Observer {
    constructor(data) {
        this.walk(data);
    }
    walk(data) {
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
    }
}
export function defineReactive(target, key, value) {
    observe(value)
    Object.defineProperty(target, key, {
        // 取值的时候会执行get
        get() {
            return value;
        },
        // 修改的时候会执行set
        set(newValue) {
            if (newValue == value) return
            value = newValue
        }
    })
}

export function observe(data) {
    // 对这个对象进行劫持
    if (typeof data !== 'object' || data == null) {
        return;
    }
    return new Observer(data);
}