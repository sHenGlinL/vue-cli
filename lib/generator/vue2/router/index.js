module.exports = (generator) => {
  generator.extendPackage(
    "vue-router",
    "^3.5.3"
  )

  generator.injectImportsVue2(
    "import router from './router'",
    "router"
  )

  generator.copyTemplate(
    "router",
    "src/router"
  )
}