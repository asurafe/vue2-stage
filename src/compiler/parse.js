// @ts-nocheck
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;

// 匹配到的分组是一个开始标签的名字 <div
const startTagOpen = new RegExp(`^<${qnameCapture}`);

// 匹配到的分组是一个结束标签的名字 </div
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);

// 匹配属性 key value
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
// 匹配到的分组是一个开始标签的结束 > />
const startTagClose = /^\s*(\/?)>/;
// 匹配到的内容就是表达式的变量 {{ a }}


export function parseHTML(html) {
    const ELEMENT_TYPE = 1;
    const TEXT_TYPE = 3;
    const stack = [];
    let currentParent;
    let root;
    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }
    // 利用栈形结构，来构建一颗树
    function start(tag, attrs) {
        // 创建一个ast节点
        let node = createASTElement(tag, attrs)
        // 看一下是否是空树
        if (!root) {
            // 如果为空则是树的根节点
            root = node
        }
        if (currentParent) {
            node.parent = currentParent
            currentParent.children.push(node)
        }
        stack.push(node)
        // currentParent为栈中的最后一个
        currentParent = node

    }
    function chars(text) {
        text = text.replace(/\s/g,'')
        // 文本直接放到当前指向的节点中
        text&&currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent
        })
    }
    function end(tag) {
        // 弹出最后一个，校验标签是否合法
        let node = stack.pop();
        currentParent = stack[stack.length - 1]
    }
    function advance(n) {
        html = html.substring(n)
    }
    function parseStartTag() {
        const start = html.match(startTagOpen)
        if (start) {
            const match = {
                // 标签名
                tagName: start[1],
                // 
                attrs: []
            }
            advance(start[0].length);

            let attr, end;
            // 如果不是开始标签的结束标签，就一直匹配下去
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length)
                match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] || true })
            }

            if (end) {
                advance(end[0].length)
            }
            return match
        }
        return false
    }
    // html最开始肯定是一个<
    while (html) {
        // 如果indexOf中的索引是0 则说明是个标签
        // 如果textEnd为0 说明是一个开始标签或者结束标签
        // 如果textEnd>0  说明是文本的结束位置
        let textEnd = html.indexOf('<');
        if (textEnd == 0) {
            // 开始标签的解析结果
            const startTagMatch = parseStartTag();
            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }
            let endTagMatch = html.match(endTag)
            if (endTagMatch) {
                advance(endTagMatch[0].length);
                end(endTagMatch[1])
                continue
            }
        }
        if (textEnd > 0) {
            let text = html.substring(0, textEnd)
            if (text) {
                chars(text)
                advance(text.length)
            }

        }
    }
    return root
}