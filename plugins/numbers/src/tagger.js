const multiples =
  '(hundred|thousand|million|billion|trillion|quadrillion|quintillion|sextillion|septillion)'

// improved tagging for numbers
const tagger = function (doc) {
  doc.match(multiples).tag('#Multiple')
  //  in the 400s
  doc.match('the [/[0-9]+s$/]').tag('#Plural')
  //half a million
  doc.match('half a? #Value').tag('Value', 'half-a-value') //(quarter not ready)
  //five and a half
  doc.match('#Value and a (half|quarter)').tag('Value', 'value-and-a-half')
  //one hundred and seven dollars
  doc.match('#Money and #Money #Currency?').tag('Money', 'money-and-money')
  // $5.032 is invalid money
  doc
    .match('#Money')
    .not('#TextValue')
    .match('/\\.[0-9]{3}$/')
    .unTag('#Money', 'three-decimal money')
  // cleanup currency false-positives
  doc.ifNo('#Value').match('#Currency #Verb').unTag('Currency', 'no-currency')

  // 6 dollars and 5 cents
  doc.match('#Value #Currency [and] #Value (cents|ore|centavos|sens)', 0).tag('Money')
  // maybe currencies
  let m = doc.match('[<num>#Value] [<currency>(mark|rand|won|rub|ore)]')
  m.group('num').tag('Money')
  m.group('currency').tag('Currency')
}
module.exports = tagger
