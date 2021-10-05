<template>
  <div class="editor">
    <div class="toolbar" ref="toolbar">
      <el-form title="upload file">
        <el-upload action="/api/admin/upload_file/"
          name="file"
          :on-success="data => uploadSucceed(data, 'file')"
          :on-error="uploadError"
          :on-progress="uploadOnProgess"
          :show-file-list="false">
          <el-button class="toolbar-object el-icon-fa-upload">
          </el-button>
        </el-upload>
      </el-form>
      <el-form title="upload image">
        <el-upload action="/api/admin/upload_image/"
          name="image"
          accept="image/*"
          :on-success="data => uploadSucceed(data, 'image')"
          :on-error="uploadError"
          :on-progress="uploadOnProgess"
          :show-file-list="false">
          <el-button class="toolbar-object el-icon-picture">
          </el-button>
        </el-upload>
      </el-form>
    </div>
    <div style="clear:both"></div>
    <textarea
      ref="editor"
      @input="onEditorInput"
    ></textarea>
    <div class="markdown-body" ref="render"></div>
    <div style="clear:both"></div>
  </div>
</template>

<script>
  import 'github-markdown-css/github-markdown.css'
  import {renderWithMarkdown} from '@/plugins/katex.js'

  export default {
    props: {
      value: {
        type: String,
        default: ''
      }
    },
    data () {
      return {
        currentValue: this.value
      }
    },
    mounted () {
      this.$refs.editor.value = this.value
      this.$refs.render.innerHTML = renderWithMarkdown(this.value)
    },
    methods: {
      onEditorInput () {
        this.currentValue = this.$refs.editor.value
        this.$refs.render.innerHTML = renderWithMarkdown(this.currentValue)
      },
      uploadSucceed (response, type) {
        if (response.success !== true) {
          this.$error(response.msg)
        } else {
          var insertStr = ''
          if (type === 'file') {
            insertStr = `[${response.file_name}](${response.file_path})`
          } else if (type === 'image') {
            insertStr = `![](${response.file_path})`
          }
          var curPos = this.$refs.editor.selectionStart
          this.$refs.editor.value = this.$refs.editor.value.slice(0, curPos) + insertStr + this.$refs.editor.value.slice(curPos)
          this.currentValue = this.$refs.editor.value
          this.$refs.render.innerHTML = renderWithMarkdown(this.currentValue)
          this.$success(response.msg)
        }
      },
      uploadError () {
        this.$error('Upload failed')
      },
      uploadOnProgess () {
        this.$message('Uploading ...')
      }
    },
    watch: {
      'value' (val) {
        if (this.currentValue !== val) {
          this.currentValue = val
          this.$refs.editor.value = val
          this.$refs.render.innerHTML = renderWithMarkdown(this.currentValue)
        }
      },
      'currentValue' (newVal, oldVal) {
        if (newVal !== oldVal) {
          this.$emit('change', newVal)
          this.$emit('input', newVal)
        }
      }
    }
  }
</script>

<style>
  .editor {
    font-size: 16px;
    padding: 5px;
  }
  .editor textarea {
    font-size: inherit;
    resize: none;
    float: left;
    width: 50%;
    height: 500px;
    border: 1px #dadde6 solid;
    padding: 18px 25px;
    line-height: 1.8;
  }
  .editor .toolbar {
    width: 100%;
    height: 50px;
    border: 1px #dadde6 solid;
    background-color: #F0F0F0;
    -moz-box-shadow: inset 0 0 10px #FFFFFF;
    -webkit-box-shadow: inset 0 0 10px #FFFFFF;
    box-shadow: inset 0 0 10px #FFFFFF;
  }
  .editor .toolbar > * {
    float: left;
    margin: 5px;
    margin-right: 0px;
  }
  .editor .toolbar .toolbar-object {
    width: 40px;
    height: 40px;
    padding: 5px;
  }
  .editor textarea:focus {
    -moz-box-shadow: inset 0 0 10px #303030;
    -webkit-box-shadow: inset 0 0 10px #303030;
    box-shadow: inset 0 0 10px #303030;;
  }
  .editor .markdown-body {
    font-size: inherit;
    float: right;
    width: 50%;
    height: 500px;
    border: 1px #dadde6 solid;
    padding: 18px 25px;
    overflow-y: auto;
    background-color: #FAFAFA;
  }
</style>
