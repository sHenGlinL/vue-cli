module.exports = (generator) => {
  generator.extendPackage(
    "element-plus",
    "^2.0.1"
  )

  generator.injectImportsVue3(
    "import ElementPlus from 'element-plus'\nimport 'element-plus/dist/index.css'",
    "use(ElementPlus)"
  )
}