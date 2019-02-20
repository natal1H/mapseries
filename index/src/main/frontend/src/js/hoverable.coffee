import $ from 'jquery'

getReferencedUnderlays = (target) ->
  ref = target.data('ref')
  if ref
    $("[data-ref='#{ref}'] .underlay")
  else
    $()


hoverIn = (e) ->
  target = $(e.target).closest('.hoverable')

  target.addClass('hovered')

  if target.hasClass('active')
    return

  underlay = target.find('.underlay')
  underlay.show()
  getReferencedUnderlays(target).show()

hoverOut = (e) ->
  target = $(e.target).closest('.hoverable')

  target.removeClass('hovered')

  if target.hasClass('active')
    return

  underlay = target.find('.underlay')
  underlay.hide()
  getReferencedUnderlays(target).hide()

export default () ->
  $(() ->
    $('.hoverable').hover(hoverIn, hoverOut)
  )
