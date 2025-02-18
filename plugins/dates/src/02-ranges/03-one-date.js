const parseDate = require('../03-parse')
const reverseMaybe = require('./_reverse')
const Unit = require('../03-parse/units/Unit')

const punt = function (unit, context) {
  unit = unit.applyShift(context.punt)
  return unit
}

module.exports = [
  {
    // 'from A to B'
    match: 'from? [<from>.+] (to|until|upto|through|thru|and) [<to>.+]',
    desc: 'from A to B',
    parse: (m, context) => {
      let from = m.groups('from')
      let to = m.groups('to')
      from = parseDate(from, context)
      to = parseDate(to, context)
      if (from && to) {
        let obj = {
          start: from,
          end: to.end(),
        }
        obj = reverseMaybe(obj)
        return obj
      }
      return null
    },
  },

  {
    // 'before june'
    match: '^due? (by|before) [.+]',
    desc: 'before june',
    group: 0,
    parse: (m, context) => {
      let unit = parseDate(m, context)
      if (unit) {
        let start = new Unit(context.today, null, context)
        if (start.d.isAfter(unit.d)) {
          start = unit.clone().applyShift({ weeks: -2 })
        }
        // end the night before
        let end = unit.clone().applyShift({ day: -1 })
        return {
          start: start,
          end: end.end(),
        }
      }
      return null
    },
  },

  {
    // 'in june'
    match: '^(on|in|at|@|during) [.+]',
    desc: 'in june',
    group: 0,
    parse: (m, context) => {
      let unit = parseDate(m, context)
      if (unit) {
        return { start: unit, end: unit.clone().end(), unit: unit.unit }
      }
      return null
    },
  },
  {
    // 'after june'
    match: '^(after|following) [.+]',
    desc: 'after june',
    group: 0,
    parse: (m, context) => {
      let unit = parseDate(m, context)
      if (unit) {
        unit = unit.after()
        return {
          start: unit.clone(),
          end: punt(unit.clone(), context),
        }
      }
      return null
    },
  },
  {
    // 'middle of'
    match: '^(middle|center|midpoint) of [.+]',
    desc: 'middle of',
    group: 0,
    parse: (m, context) => {
      let unit = parseDate(m, context)
      let start = unit.clone().middle()
      let end = unit.beforeEnd()
      if (unit) {
        return {
          start: start,
          end: end,
        }
      }
      return null
    },
  },
  {
    // 'tuesday after 5pm'
    match: '.+ after #Time+$',
    desc: 'tuesday after 5pm',
    parse: (m, context) => {
      let unit = parseDate(m, context)
      if (unit) {
        let start = unit.clone()
        let end = unit.end()
        return {
          start: start,
          end: end,
          unit: 'time',
        }
      }
      return null
    },
  },
  {
    // 'tuesday before noon'
    match: '.+ before #Time+$',
    desc: 'tuesday before noon',
    parse: (m, context) => {
      let unit = parseDate(m, context)
      let end = unit.clone()
      let start = unit.start()
      if (unit) {
        return {
          start: start,
          end: end,
          unit: 'time',
        }
      }
      return null
    },
  },
]
