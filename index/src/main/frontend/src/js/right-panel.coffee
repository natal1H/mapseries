import $ from 'jquery'
import events from 'js/events'

dectivateMainTabs = () -> $('.nav-tabs a').removeClass('active')

deactiveAuthorsTab = () -> $('#authors-tab').removeClass('active')

updateTabSize = () ->
  windowHeight = $(window).height()
  tab = $('.tab-pane.active')
  padding = $('#pannel-padding')
  footer = $('#footer')
  # reset heights before doing any calculations
  padding.css('height', '0px')
  tab.css('height', 'auto');
  tabPosition = tab.position()
  tabHeight = tab.height() + footer.outerHeight()

  if tabPosition.top + tabHeight > windowHeight
    newTabHeight = (windowHeight - tabPosition.top) - footer.outerHeight()
    tab.css('height', Math.round(newTabHeight) + 'px')
    tab.css('overflow-y', 'scroll')
  else
    footerOffset = footer.offset()
    footerBottom = footerOffset.top + footer.outerHeight()
    paddingHeight = Math.round(windowHeight - footerBottom)
    padding.css('height', paddingHeight + 'px')
    tab.css('height', 'auto')
    tab.css('overflow-y', 'hidden')

addSlashBetweenZoomButtons = () ->
  $('.ol-zoom.ol-control button.ol-zoom-in').after('<span>/</span>')

updateScrollbar = ->
  func = ->
    container = $('#main')
    activeItem = $('.right-panel .serie.active')

    if not activeItem.length
      return

    activeItemTop = Math.round(activeItem.position().top)
    activeItemBottom = activeItemTop + activeItem.height()

    if activeItemBottom > $(window).height() || activeItemTop < 0
      container.scrollTop(activeItemTop - 20)

  window.setTimeout(func, 500)

langSwitcher = ->
  select = $('#lang-switcher')
  select.change (e) ->
    anchor = window.location.hash
    window.location = "#{window.langUrls[select.val()]}#{anchor}"

export default {
  main: ->
    $(() ->
      addSlashBetweenZoomButtons()
      updateScrollbar()
      langSwitcher()
    )
    events.on('resize', updateTabSize)
    $('a[data-toggle="tab"]').on('shown.bs.tab', (e) ->
      if e.target.id == 'authors-tab'
        dectivateMainTabs()
      else
        deactiveAuthorsTab()
      updateTabSize()
    )
}
