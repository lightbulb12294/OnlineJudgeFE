import Vue from 'vue'
import storage from '@/utils/storage'
import { STORAGE_KEY } from '@/utils/constants'
import ojAPI from '@oj/api'

function submissionMemoryFormat (memory) {
  if (memory === undefined) return '--'
  // 1048576 = 1024 * 1024
  let t = parseInt(memory) / 1048576
  return String(t.toFixed(0)) + 'MB'
}

function submissionTimeFormat (time) {
  if (time === undefined) return '--'
  return time + 'ms'
}

function getACRate (acCount, totalCount) {
  let rate = totalCount === 0 ? 0.00 : (acCount / totalCount * 100).toFixed(2)
  return String(rate) + '%'
}

// 去掉值为空的项，返回object
function filterEmptyValue (object) {
  let query = {}
  Object.keys(object).forEach(key => {
    if (object[key] || object[key] === 0 || object[key] === false) {
      query[key] = object[key]
    }
  })
  return query
}

// 按指定字符数截断添加换行，非英文字符按指定字符的半数截断
function breakLongWords (value, length = 16) {
  let re
  if (escape(value).indexOf('%u') === -1) {
    // 没有中文
    re = new RegExp('(.{' + length + '})', 'g')
  } else {
    // 中文字符
    re = new RegExp('(.{' + (length / 2 + 1) + '})', 'g')
  }
  return value.replace(re, '$1\n')
}

function downloadFile (url) {
  return new Promise((resolve, reject) => {
    Vue.prototype.$http.get(url, {responseType: 'blob'}).then(resp => {
      let headers = resp.headers
      if (headers['content-type'].indexOf('json') !== -1) {
        let fr = new window.FileReader()
        if (resp.data.error) {
          Vue.prototype.$error(resp.data.error)
        } else {
          Vue.prototype.$error('Invalid file format')
        }
        fr.onload = (event) => {
          let data = JSON.parse(event.target.result)
          if (data.error) {
            Vue.prototype.$error(data.data)
          } else {
            Vue.prototype.$error('Invalid file format')
          }
        }
        let b = new window.Blob([resp.data], {type: 'application/json'})
        fr.readAsText(b)
        return
      }
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(new window.Blob([resp.data], {type: headers['content-type']}))
      link.download = (headers['content-disposition'] || '').split('filename=')[1]
      document.body.appendChild(link)
      link.click()
      link.remove()
      resolve()
    }).catch(() => {})
  })
}

function getLanguages () {
  return new Promise((resolve, reject) => {
    let languages = storage.get(STORAGE_KEY.languages)
    if (languages) {
      resolve(languages)
    }
    ojAPI.getLanguages().then(res => {
      let languages = res.data.data.languages
      storage.set(STORAGE_KEY.languages, languages)
      resolve(languages)
    }, err => {
      reject(err)
    })
  })
}

// fix request network error: replace "() {" and record position
function getIndicesOf (searchStr, str) {
  var searchStrLen = searchStr.length
  if (searchStrLen === 0) {
    return []
  }
  var startIndex = 0
  var index
  var indices = []
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index)
    startIndex = index + searchStrLen
  }
  return indices
}
function replace (data) {
  if (typeof data === 'object' && data !== null) {
    let keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]
      if (typeof data[key] === 'string') {
        let idx = getIndicesOf('() {', data[key])
        if (idx.length !== 0) {
          let text = Array.from(data[key])
          for (let j = 0; j < idx.length; j++) {
            idx[j] += 2
            text[idx[j]] = '1'
          }
          data[key] = {'text': text.join(''), 'replace': idx}
        }
      } else {
        replace(data[key])
      }
    }
  }
}

export default {
  submissionMemoryFormat: submissionMemoryFormat,
  submissionTimeFormat: submissionTimeFormat,
  getACRate: getACRate,
  filterEmptyValue: filterEmptyValue,
  breakLongWords: breakLongWords,
  downloadFile: downloadFile,
  getLanguages: getLanguages,
  replace: replace
}
