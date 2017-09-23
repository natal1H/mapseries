import $ from 'jquery'

export default {
  show: ->
    console.log('show loading')
    $('.loading').show()

  hide: ->
    console.log('hide loading')
    $('.loading').hide()
}
