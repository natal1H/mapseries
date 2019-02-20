import $ from 'jquery'

export default {
  clip: (target) ->
    elem = null
    if typeof target == "string"
      elem = $("##{target}").get(0)
    else
      elem = target
    range = document.createRange()
    range.selectNodeContents(elem)
    sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
}
