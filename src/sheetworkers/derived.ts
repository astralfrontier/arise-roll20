// This is provided in sheet.pug but Typescript doesn't know that
// @ts-ignore
const derived_local = variables['derived']

for (let derived of derived_local) {
  // If the VAWN attribute changes, or *_base or _eq changes, recompute
  on(
    `change:vawn_${derived.vawn_attr}_mod change:${derived.attr}_base change:${derived.attr}_eq`,
    (_event) => {
      getAttrs(
        [
          `vawn_${derived.vawn_attr}_mod`,
          `${derived.attr}_base`,
          `${derived.attr}_eq`,
        ],
        (values) => {
          let total = 0
          for (let value of Object.values(values)) {
            total = total + parseInt(value || '0')
          }
          let derived_updated: AttributeBundle = {}
          derived_updated[derived.attr] = `${total}`
          setAttrs(derived_updated)
        }
      )
    }
  )
}

on(`change:vawn_vigor_mod change:hp_wounds change:hp_base`, (_event) => {
  getAttrs(['vawn_vigor_mod', 'hp_wounds', 'hp_base'], (values) => {
    setAttrs({
      hp_max: `${
        parseInt(values['vawn_vigor_mod'] || '0') +
        parseInt(values['hp_base'] || '0') -
        parseInt(values['hp_wounds'] || '0')
      }`,
    })
  })
})

on(`change:vawn_nous_mod change:mp_base`, (_event) => {
  getAttrs(['vawn_nous_mod', 'mp_base'], (values) => {
    setAttrs({
      mp_max: `${
        parseInt(values['vawn_nous_mod'] || '0') +
        parseInt(values['mp_base'] || '0')
      }`,
    })
  })
})
