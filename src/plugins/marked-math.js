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
  level: 'block',
  start(src) {
    let _ = src.match(/\$\$[^\$]/)
    if (_ !== null) {
      return _.index
    } else {
      return undefined
    }
  },
  tokenizer(src) {
    const rule = /^\$\$((\\\$|[^\$])+?)\n\$\$/
    const match = rule.exec(src)
    if (match) {
      const token = {
        type: 'blockMath',
        raw: match[0],
        text: match[1],
      }
      return token
    }
  },
  renderer(token) {
    return render(token.text, {displayMode: true})
  }
}
const inlineSup = {
  name: 'inlineSup',
  level: 'inline',
  start(src) {
    let _ = src.match(/\^[^\^\n]/)
    if (_ !== null) {
      return _.index
    } else {
      return undefined
    }
  },
  tokenizer(src) {
    const rule = /^\^([^\^\n]+?)\^/
    const match = rule.exec(src)
    if (match) {
      const token = {
        type: 'inlineSup',
        raw: match[0],
        text: match[1],
        tokens: []
      }
      this.lexer.inline(token.text, token.tokens)
      return token
    }
  },
  renderer(token) {
    return `<sup>${this.parser.parseInline(token.tokens)}</sup>`
  }
}
const inlineSub = {
  name: 'inlineSub',
  level: 'inline',
  start(src) {
    let _ = src.match(/_[^_\n]/)
    if (_ !== null) {
      return _.index
    } else {
      return undefined
    }
  },
  tokenizer(src) {
    const rule = /^_([^_\n]+?)_/
    const match = rule.exec(src)
    if (match) {
      const token = {
        type: 'inlineSub',
        raw: match[0],
        text: match[1],
        tokens: []
      }
      this.lexer.inline(token.text, token.tokens)
      return token
    }
  },
  renderer(token) {
    return `<sub>${this.parser.parseInline(token.tokens)}</sub>`
  }
}
const inlineHl = {
  name: 'inlineHl',
  level: 'inline',
  start(src) {
    let _ = src.match(/==[^\n]/)
    if (_ !== null) {
      return _.index
    } else {
      return undefined
    }
  },
  tokenizer(src) {
    const rule = /^==([^\n]+?)==/
    const match = rule.exec(src)
    if (match) {
      const token = {
        type: 'inlineHl',
        raw: match[0],
        text: match[1],
        tokens: []
      }
      this.lexer.inline(token.text, token.tokens)
      return token
    }
  },
  renderer(token) {
    return `<span style='background-color:yellow'>${this.parser.parseInline(token.tokens)}</span>`
  }
}
const spoiler = {
  name: 'spoiler',
  level: 'block',
  start(src) {
    let _ = src.match(/:::spoiler/)
    if (_ !== null) {
      return _.index
    } else {
      return undefined
    }
  },
  tokenizer(src) {
    const rule = /^:::spoiler( .+)?(([^:]|:[^:]|::[^:])+?)\n:::/
    const match = rule.exec(src)
    if (match) {
      const token = {
        type: 'spoiler',
        raw: match[0],
        summary: match[1],
        text: match[2],
        tokens: []
      }
      this.lexer.blockTokens(token.text, token.tokens)
      return token
    }
  },
  renderer(token) {
    if (token.summary === undefined) {
      return `<details>${token.text}</details>`
    } else {
      return `<details><summary>${token.summary}</summary>${this.parser.parse(token.tokens)}</details>`
    }
  }
}
/* eslint-enable */

// math render support
marked.use({ extensions: [inlineMath, blockMath] })
// other inline support
marked.use({ extensions: [inlineSup, inlineSub, inlineHl] })

marked.use({ extensions: [spoiler] })

export default marked
