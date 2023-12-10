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
    O[newAttr] = status.description
    console.dir(O)
    setAttrs(O)
  }
})
