'use strict'

const Joi = require('joi')
const { addv } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')
const { BaseYamlService } = require('..')

const schema = Joi.object({
  CurrentVersion: Joi.alternatives()
    .try(Joi.number(), Joi.string())
    .required(),
}).required()

module.exports = class FDroid extends BaseYamlService {
  static render({ version }) {
    return {
      message: addv(version),
      color: versionColor(version),
    }
  }

  async handle({ appId }) {
    const result = await this._requestYaml({
      schema,
      url: `https://gitlab.com/fdroid/fdroiddata/raw/master/metadata/${appId}.yml`,
      errorMessages: {
        404: 'app not found',
      },
    })

    return this.constructor.render({ version: result.CurrentVersion })
  }

  // Metadata
  static get defaultBadgeData() {
    return { label: 'f-droid' }
  }

  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'f-droid/v',
      pattern: ':appId',
      queryParams: ['metadata_format'],
    }
  }

  static get examples() {
    return [
      {
        title: 'F-Droid',
        namedParams: { appId: 'org.thosp.yourlocalweather' },
        staticPreview: this.render({ version: '1.0' }),
        keywords: ['fdroid', 'android', 'app'],
      },
      {
        title: 'F-Droid (explicit metadata format)',
        namedParams: { appId: 'org.dystopia.email' },
        queryParams: { metadata_format: 'yml' },
        staticPreview: this.render({ version: '1.2.1' }),
        keywords: ['fdroid', 'android', 'app'],
      },
    ]
  }
}
