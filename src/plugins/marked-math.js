import katex from 'katex'
import 'katex/dist/katex.min.css'
import marked from 'marked'

function _ () {
}

const defaultOptions = {
  errorCallback: _,
  throwOnError: false
}

function render (src, opt) {
  let options = {}
  if (opt) {
    options = opt || {}
  }
  Object.assign(options, defaultOptions)
  return katex.renderToString(src, options)
}

/* eslint-disable */
const inlineMath = {
  name: 'inlineMath',
  level: 'inline',
  start(src) {
    let _ = src.match(/\$[^\$\n]/)
    if (_ !== null) {
      return _.index
    } else {
      return undefined
    }
  },
  tokenizer(src) {
    const rule = /^\$((\\\$|[^\$\n])+?)\$/
    const match = rule.exec(src)
    if (match) {
      const token = {
        type: 'inlineMath',
        raw: match[0],
        text: match[1],
        tokens: []
      }
      return token
    }
  },
  renderer(token) {
    return render(token.text, {displayMode: false})
  }
}
const blockMath = {
  name: 'blockMath',
  level: 'inline',
  start(src) {
    let _ = src.match(/\$\$[^\$]/)
    if (_ !== null) {
      return _.index
    } else {
      return undefined
    }
  },
  tokenizer(src) {
    const rule = /^\$\$((\\\$|[^\$])+?)\$\$/
    const match = rule.exec(src)
    if (match) {
      const token = {
        type: 'blockMath',
        raw: match[0],
        text: match[1],
        tokens: []
      }
      return token
    }
  },
  renderer(token) {
    return render(token.text, {displayMode: true})
  }
}
marked.use({ extensions: [inlineMath, blockMath] })
/* eslint-enable */

export default marked
