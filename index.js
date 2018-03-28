let binding;
try {
  binding = require('./build/Release/tree_sitter_runtime_binding')
} catch (e) {
  binding = require('./build/Debug/tree_sitter_runtime_binding')
}

const {Document, ASTNode, ASTNodeArray, pointTransferArray} = binding;

class StringInput {
  constructor (string, bufferSize) {
    this.position = 0
    this.string = string
    this.bufferSize = Number.isFinite(bufferSize) ? bufferSize : null
  }

  seek (position) {
    this.position = position
  }

  read () {
    const result = this.string.slice(this.position)
    this.position = this.string.length
    return result
  }
}

Document.prototype.setInputString = function (string, bufferSize) {
  this.invalidate()
  this.setInput(new StringInput(string, bufferSize))
  return this
}

ASTNodeArray.prototype[Symbol.iterator] = function* () {
  let node = this[0];

  const getNext = this.isNamed ?
    (node) => node.nextNamedSibling :
    (node) => node.nextSibling;

  if (node) {
    yield node;
    while ((node = getNext(node))) {
      yield node;
    }
  }
}

const {startPosition, endPosition} = ASTNode.prototype

Object.defineProperty(ASTNode.prototype, 'startPosition', {
  get () {
    startPosition.call(this)
    return {row: pointTransferArray[0], column: pointTransferArray[1]}
  }
})

Object.defineProperty(ASTNode.prototype, 'endPosition', {
  get () {
    endPosition.call(this)
    return {row: pointTransferArray[0], column: pointTransferArray[1]}
  }
})

exports.Document = Document
