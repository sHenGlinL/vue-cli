module.exports = (generator) => {
  generator.extendPackage(
    "vuex",
    "^4.0.2"
  )

  generator.injectImports(
    "import { store, key } from './store'",
    "use(store, key)"
  )

  generator.copyTemplate(
    "vuex",
    "src/store"
  )
}