// @ts-nocheck
import { newArrayProto } from "./array";

class Observer {
    constructor(data) {
        // 给数据加了一个标识，如果数据上有__ob__,则说明这个属性被观测过
        Object.defineProperty(data, '__ob__', {
            value: this,
            // 将__ob__变成不可枚举的(循环的时候无法获取)
            enumerable: false
        })
        // data.__ob__ = this;
        if (Array.isArray(data)) {
            // 需要保留数组原有的方法,并且可以重写部分方法
            data.__proto__ = newArrayProto

            this.observeArray(data)
        } else {
            this.walk(data);
        }
    }
    walk(data) {
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
    }
    observeArray(data) {
        data.forEach(item => observe(item))
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
    // 如果data上有__ob__属性，说明他被观测过了
    if (data.__ob__ instanceof Observer) {
        return data.__ob__
    }
    return new Observer(data);
}