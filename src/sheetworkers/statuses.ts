// This is provided in sheet.pug but Typescript doesn't know that
// @ts-ignore
const statuses_local = variables['statuses']

on('change:repeating_statuses:status', (event) => {
  console.dir(event)
  const statusName = (event.newValue || '').toUpperCase()
  const status = statuses_local.find((status) => status.name == statusName)
  if (status) {
    console.dir(status)
    const attr = event.sourceAttribute || ''
    const newAttr = attr.replace(/_status$/, '_rules')
    const O: AttributeBundle = {}
    O[newAttr] = status.rules
    console.dir(O)
    setAttrs(O)
  }
})

function reduceStatusDurations(amount: number) {
  getSectionIDs('statuses', function (idarray) {
    const attrs = idarray.map((name) => `repeating_statuses_${name}_duration`)
    getAttrs(attrs, (values) => {
      for (let value of Object.keys(values)) {
        values[value] = `${Math.max(
          0,
          parseInt(values[value] || '0') - amount
        )}`
      }
      setAttrs(values)
      // TODO: remove statuses with duration 0
    })
  })
}

on('clicked:statusturn', (event) => {
  reduceStatusDurations(1)
})
