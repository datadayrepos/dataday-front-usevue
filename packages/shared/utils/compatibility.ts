// this is just a hack toavoid usingvue-demi since we are only using vue 3
const isVue3 = true
export const directiveHooks = {
  mounted: (isVue3 ? 'mounted' : 'inserted') as 'mounted',
  updated: (isVue3 ? 'updated' : 'componentUpdated') as 'updated',
  unmounted: (isVue3 ? 'unmounted' : 'unbind') as 'unmounted',
}
