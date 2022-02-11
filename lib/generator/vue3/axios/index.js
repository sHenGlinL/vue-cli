module.exports = (generator) => {
  generator.extendPackage(
    "axios",
    "^0.25.0"
  )

  generator.copyTemplate(
    "axios",
    "src"
  )
}