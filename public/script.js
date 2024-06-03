  var doc = nlp('two bottles of beer')
  doc.numbers().minus(1)
  document.body.innerHTML = doc.text()
  // 'one bottle of beer'