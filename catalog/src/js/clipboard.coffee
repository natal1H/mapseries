
import ZeroClipboard from 'zeroclipboard'
import $ from 'jquery'

class Connection
  constructor: (@buttonId, @textFunc) ->

  destroy: () ->
    throw new Error('This is abstract method and must be overrided.')

class JSConnection extends Connection
  constructor: (buttonId, textFunc) ->
    super(buttonId, textFunc)
    @eventListener = null

    @__createEventListener()
    @__registerEventListener()

  destroy: () ->
    @__unregisterEventListener()

  __createEventListener: () ->
    @eventListener = () =>
      textToCopy = @textFunc();
      navigator.clipboard.writeText(textToCopy)
        .catch((err) -> console.log("Error when copying text to clipboard: #{err}"))

  __registerEventListener: () ->
    document.getElementById(@buttonId).addEventListener('click', @eventListener)

  __unregisterEventListener: () ->
    document.getElementById(@buttonId).removeEventListener('click', @eventListener)
    @eventListener = null

class FlashConnection extends Connection
  constructor: (buttonId, textFunc) ->
    super(buttonId, textFunc)
    @zeroClipboardClient = null

    @__createZeroClipboardConnection()

  destroy: () ->
    @__destroyZeroClipboardConnection()

  __createZeroClipboardConnection: () ->
    @zeroClipboardClient = new ZeroClipboard($(document.getElementById(@buttonId)))
    @zeroClipboardClient.on('copy', @__eventListenerHandler)

  __destroyZeroClipboardConnection: () ->
    @zeroClipboardClient.destroy()

  __eventListenerHandler: (e) =>
    textToCopy = @textFunc()
    @zeroClipboardClient.setText(textToCopy)

class Clipboard
  @instance = null

  @getInstance: () ->
    if @instance is null
      @instance = new Clipboard()

    return @instance

  constructor: () ->
    @connections = []

  deregisterButtons: () ->
    connection.destroy() for connection in @connections
    @connections = []

  registerButton: (buttonId, textFunc) ->
    if @isJSApiSupported()
      @createJSConnection(buttonId, textFunc)
    else
      @createFlashConnection(buttonId, textFunc)

  isJSApiSupported: () ->
    return navigator?.clipboard?.writeText

  createJSConnection: (buttonId, textFunc) ->
    @connections.push(new JSConnection(buttonId, textFunc))

  createFlashConnection: (buttonId, textFunc) ->
    @connections.push(new FlashConnection(buttonId, textFunc))

export default Clipboard
