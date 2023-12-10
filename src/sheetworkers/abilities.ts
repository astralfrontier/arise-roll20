// This is provided in sheet.pug but Typescript doesn't know that
// @ts-ignore
const abilities_local = variables['abilities']

on('change:repeating_abilities:name', (event) => {
  console.dir(event)
  const abilityName = (event.newValue || '').toUpperCase()
  const ability = abilities_local.find(
    (ability) => ability.name.toUpperCase() == abilityName
  )
  if (ability) {
    const attr = event.sourceAttribute || ''
    const newAttrBase = attr.replace(/_name$/, '')
    const O: AttributeBundle = {}
    O[`${newAttrBase}_type`] = ability.type
    O[`${newAttrBase}_page`] = ability.page
    O[`${newAttrBase}_rules`] = ability.rules
    setAttrs(O)
  }
})
