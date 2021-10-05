import 'katex'
import renderMathInElement from 'katex/contrib/auto-render/auto-render'
import 'katex/dist/katex.min.css'
import marked from 'marked'

function _ () {
}

const defaultOptions = {
  errorCallback: _,
  throwOnError: false,
  delimiters: [
    {left: '$$', right: '$$', display: true},
    {left: '$', right: '$', display: false},
    {left: '\\[', right: '\\]', display: true},
    {left: '\\(', right: '\\)', display: false}
  ]
}

function render (el, binding) {
  let options = {}
  if (binding.value) {
    options = binding.value.options || {}
  }
  Object.assign(options, defaultOptions)
  renderMathInElement(el, options)
}

export function renderWithMarkdown (x) {
  let options = {}
  Object.assign(options, defaultOptions)
  if (typeof x === 'string') {
    let el = document.createElement('div')
    el.innerHTML = x
    renderMathInElement(el, options)
    console.log(el.innerHTML)
    x = el.innerHTML
    x = marked(x)
    return x
  } else {
    renderMathInElement(x, options)
    x.innerHTML = marked(x.innerHTML)
  }
}

export default {
  install: function (Vue, options) {
    Vue.directive('katex', {
      bind: render,
      componentUpdated: render
    })
  }
}
