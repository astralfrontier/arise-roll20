// This is provided in sheet.pug but Typescript doesn't know that
// @ts-ignore
const vawn_local = variables['vawn']

for (let attribute of vawn_local) {
  // The basic structure for Roll20 attributes
  const attr_base = `vawn_${attribute.name.toLowerCase()}`
  const skills = attribute.skills.map(
    (skill) => `${attr_base}_skill_${skill.toLowerCase()}`
  )
  const skills_change = skills.map((skill) => `change:${skill}`).join(' ')

  on(
    `change:${attr_base} change:${attr_base}_condition ${skills_change}`,
    (event) => {
      // Recalculate the entire attribute silo, taking condition into account
      const attr = `vawn_${attribute.name.toLowerCase()}`
      const condition_attribute = `${attr}_condition`

      getAttrs([attr, condition_attribute, ...skills], (values) => {
        console.log('getAttrs: values')
        console.dir(values)
        let newValue = Math.floor(parseInt(values[attr_base] || '01') / 10)
        if (values[condition_attribute] == 'on') {
          newValue = newValue - 2
        }

        let vawn_updated: AttributeBundle = {}

        vawn_updated[`${attr}_mod`] = `${newValue}`
        for (let skill of skills) {
          vawn_updated[`${skill}_mod`] = `${
            parseInt(values[skill] || '0') + newValue
          }`
        }
        console.log('setAttrs: values')
        console.dir(vawn_updated)
        setAttrs(vawn_updated)
      })
    }
  )
}
