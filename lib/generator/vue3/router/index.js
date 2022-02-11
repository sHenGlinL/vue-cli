module.exports = (generator) => {
  generator.extendPackage(
    "vue-router",
    "^4.0.5"
  )

  generator.injectImports(
    "import router from './router'",
    "use(router)"
  )

  generator.copyTemplate(
    "router",
    "src/router"
  )
}