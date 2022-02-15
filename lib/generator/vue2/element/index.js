module.exports = (generator) => {
  generator.extendPackage(
    "element-ui",
    "^2.15.7"
  )

  generator.injectImportsVue2(
    "import Element from 'element-ui'\nimport 'element-ui/lib/theme-chalk/index.css'\nVue.use(Element)"
  )
}