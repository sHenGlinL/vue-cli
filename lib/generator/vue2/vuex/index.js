module.exports = (generator) => {
  generator.extendPackage(
    "vuex",
    "^3.6.2"
  )

  generator.injectImportsVue2(
    "import store from './store'",
    "store"
  )

  generator.copyTemplate(
    "vuex",
    "src/store"
  )
}