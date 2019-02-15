import $ from 'jquery'
import texts from 'texts'
import ebus from 'ebus'

getTextFromJSON = (key, lang, callback) ->
  text = texts[key]
  if text
    callback(text[lang])
    return true
  else
    return false

getTextFromFile = (key, lang, callback) ->
  url = "texts/#{lang}/#{key}.html"
  $.ajax(
    url: url
    dataType: 'html'
    success: callback
    error: (xhr, status, error) ->
      console.error("Loading of text from '#{url}' was not successful. Status: #{status} Error: #{error}");
  )
  return true

switchLang = (lang, parentNode) ->

  textLocators = [getTextFromJSON, getTextFromFile]
  selector = null

  if parentNode?
    selector = "#{parentNode} [data-text-ref]"
  else
    selector = '[data-text-ref]'

  textsToTranslate = $(selector).length

  $(selector).each((i, e) ->
    e = $(e)
    key = e.attr('data-text-ref')

    updateText = (text) ->
      target = e.attr('data-text-target')
      if target
        e.attr(target, text)
      else
        e.html(text)

      e.removeClass((index, classes) ->
        return classes
                .split(' ')
                .filter((cls) -> cls.startsWith('lang-'))
                .join(' ');
      )
      e.addClass("lang-#{lang}")
      textsToTranslate--;
      if textsToTranslate is 0
        ebus.fire('texts-updated')

    textLocators.some((locator) -> locator(key, lang, updateText))
  )

init = ->
  $('#lang-switcher').on('change', (e) ->
    lang = $(e.target).val()
    switchLang(lang)
  )
  ebus.on('dialog-shown', () ->
    lang = $('#lang-switcher').val()
    switchLang(lang, '.template-dialog')
  )

  lang = $('#lang-switcher').val()
  switchLang(lang)

getText = (key) ->
  lang = $('#lang-switcher').val()
  text = texts[key]
  return text[lang]

export default {
  init: init
  getText: getText
}
