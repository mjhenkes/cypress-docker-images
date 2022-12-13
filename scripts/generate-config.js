const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml');

const imageType = process.argv[2]
const imageTag = process.argv[3]

if (!imageType) {
  console.error('expected an image type like included')
  process.exit(1)
}

if (!imageTag) {
  console.error('expected Cypress version argument like 3.8.3')
  process.exit(1)
}

const getImageType = (imageType) => {
  switch(imageType) {
    case 'base':
      return 'base'
    case 'browsers':
      return 'browsers'
    case 'included':
      return 'included'
    default:
      throw new Error(`Invalid image type of ${imageType}. Must be either base, browsers, or included`)
  }
}

const sanitizedImageType = getImageType(imageType)

const getBrowserVersions = (tag) => {
  // default to empty string
  const browsers = {
    chromeVersion: "",
    firefoxVersion: "",
    edgeVersion: ""
  }

  if (sanitizedImageType !== 'browsers') {
    console.log('sanitizedImageType not browsers')
    return browsers
  }

  if (tag.includes('-chrome')) {
    browsers.chromeVersion = `Google Chrome ${tag.match(/-chrome\d*/)[0].substring(7)}`
  }

  if (tag.includes('-ff')) {
    browsers.firefoxVersion = `Mozilla Firefox ${tag.match(/-chrome\d*/)[0].substring(7)}`
  }

  if (tag.includes('-edge')) {
    browsers.edgeVersion = "Microsoft Edge"
  }
  console.log('returned browsers ', browsers)
  return browsers
}

const updateConfigFile = (circleCiConfig) => {
  circleCiConfig.parameters.imageType.default = sanitizedImageType
  circleCiConfig.parameters.dockerTag.default = imageTag

  const {
    chromeVersion,
    firefoxVersion,
    edgeVersion
  } = getBrowserVersions(imageTag)

  circleCiConfig.parameters.chromeVersion.default = chromeVersion
  circleCiConfig.parameters.firefoxVersion.default = firefoxVersion
  circleCiConfig.parameters.edgeVersion.default = edgeVersion

  return circleCiConfig
}

const writeConfigFile = () => {
  const circleCiConfig = yaml.load(fs.readFileSync(path.join(__dirname, '..', 'circle.yml')))
  
  updateConfigFile(circleCiConfig)

  fs.writeFileSync('circle.yml', yaml.dump(circleCiConfig, { lineWidth: -1 }), 'utf8')
  console.log('Generated circle.yml')
}

writeConfigFile()
