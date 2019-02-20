import $ from 'jquery'
import events from 'js/events'

updateScrollbar = ->
  func = ->
    container = $('.main.sheet .left-panel')
    activeItem = $('.main.sheet .left-panel .item.active')
    activeItemTop = Math.round(activeItem.position().top)
    activeItemBottom = activeItemTop + activeItem.height()

    if activeItemBottom > $(window).height() || activeItemTop < 0
      container.scrollTop(activeItemTop - 20)

  window.setTimeout(func, 500)

registerKeyDownListener = ->

  movePage = (direction) ->
    a = $(".main.sheet .detail .arrow.#{direction}")
    if a.length
      window.location = a.attr('href')

  closeDetail = ->
    a = $('.main.sheet .detail .close-button')
    window.location = a.attr('href')

  $(document).keydown (e) ->
    console.log(e)
    if e.key == 'ArrowLeft'
      e.preventDefault()
      movePage('left')
    else if e.key == 'ArrowRight'
      e.preventDefault()
      movePage('right')
    else if e.key == 'Escape'
      e.preventDefault()
      closeDetail()

updateLayout = ->
  metadata = $('.main.sheet .detail .metadata-container')
  metadataTop = metadata.offset().top
  windowHeight = $(window).height()
  metadataHeight = Math.round(windowHeight - metadataTop)
  metadata.css('height', "#{metadataHeight}px")

export default {
  main: ->
    $(() ->
      updateScrollbar()
      registerKeyDownListener()
    )
    events.on('resize', updateLayout)
}
