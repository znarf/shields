'use strict'

const Joi = require('joi')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = (module.exports = require('..').createServiceTester())

const testYmlString = `
Categories: System
License: MIT
WebSite: https://github.com/axxapy/apkExtractor/blob/HEAD/README.md
SourceCode: https://github.com/axxapy/apkExtractor
IssueTracker: https://github.com/axxapy/apkExtractor/issues

AutoName: Apk Extractor
Summary: Get APK files from installed apps
Description: |-
    Extract APKs from your device, even if installed from the Playstore. Root access
    is required for paid apps.

    * Fast and easy to use.
    * Extracts almost all applications, includes system applications.
    * ROOT access only required for extracting paid apps.
    * Apk's will be saved in /sdcard/Download/Eimon/.
    * Provided Search option to search applications.
    * Compatible with latest version of Android 6.0
    * Saved apk format : AppPackageName.apk.

RepoType: git
Repo: https://github.com/axxapy/apkExtractor

Builds:
  - versionName: '1.2'
    versionCode: 32
    commit: '0.32'
    subdir: app
    gradle:
      - yes

  - versionName: '1.4'
    versionCode: 33
    commit: '5'
    subdir: app
    gradle:
      - yes

AutoUpdateMode: Version %v
UpdateCheckMode: Tags
CurrentVersion: 1.4
CurrentVersionCode: 33
`
const base = 'https://gitlab.com'
const path = '/fdroid/fdroiddata/raw/master/metadata/axp.tool.apkextractor'

t.create('Package is found')
  .get('/axp.tool.apkextractor.json')
  .intercept(nock =>
    nock(base)
      .get(`${path}.yml`)
      .reply(200, testYmlString)
  )
  .expectJSON({ name: 'f-droid', value: 'v1.4' })

t.create('Package is not found')
  .get('/axp.tool.apkextractor.json')
  .intercept(nock =>
    nock(base)
      .get(`${path}.yml`)
      .reply(404)
  )
  .expectJSON({ name: 'f-droid', value: 'app not found' })

t.create('Package is found with missing "CurrentVersion"')
  .get('/axp.tool.apkextractor.json')
  .intercept(nock =>
    nock(base)
      .get(`${path}.yml`)
      .reply(200, 'Categories: System')
  )
  .expectJSON({ name: 'f-droid', value: 'invalid response data' })

t.create('Package is not found')
  .get('/axp.tool.apkextractor.json')
  .intercept(nock =>
    nock(base)
      .get(`${path}.yml`)
      .reply(404)
  )
  .expectJSON({ name: 'f-droid', value: 'app not found' })

/* If this test fails, either the API has changed or the app was deleted. */
t.create('The real api did not change (original yml converted to txt)')
  .get('/org.thosp.yourlocalweather.json')
  .only()
  .timeout(10000)
  .expectJSONTypes(
    Joi.object().keys({
      name: 'f-droid',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('The real api did not change (yml metadata format)')
  .get('/org.dystopia.email.json')
  .timeout(10000)
  .expectJSONTypes(
    Joi.object().keys({
      name: 'f-droid',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )
