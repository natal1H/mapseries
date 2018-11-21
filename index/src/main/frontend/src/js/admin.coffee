import events from 'js/events'
import $ from 'jquery'

updateLayout = () ->
  windowHeight = $(window).height()
  headerHeight = $('.header').height()
  mainHeight = Math.round(windowHeight - headerHeight)
  rightPanelHeaderHeight = 0
  $('.main').css('height', "#{mainHeight}px")

topPanel = () ->
  $('#toggle-btn').on 'click', (e) ->
    e.preventDefault()

    if $(window).outerWidth() > 1194
      $('nav.side-navbar').toggleClass('shrink')
      $('.page').toggleClass('active')
    else
      $('nav.side-navbar').toggleClass('show-sm')
      $('.page').toggleClass('active-sm')

    $('.page').on 'transitionend webkitTransitionEnd oTransitionEnd', () -> events.fire 'main-resized'

updateLayoutOfLog = () ->
  log = $('#log')
  height = Math.round($(window).height() - log.offset().top) - 50
  log.css('height', "#{height}px")

export default {
  main: ->
    $(() ->
      topPanel()
    )
    events.on('resize', updateLayout)

  log: ->
    events.on('resize', updateLayoutOfLog)
}
