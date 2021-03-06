/* eslint-disable no-unused-expressions */

const savor = require('savor')
const { Archive, File } = require('../..')
const fs = require('fs-extra')
const npm = require('libnpm')

savor.

add('should not load a missing archive', (context, done) => {
    const archive = new Archive({ dir: context.dir, id: 'test-archive' })
    const stub = context.stub(npm, 'manifest').callsFake(() => Promise.resolve({ version: "1" }))

    savor.promiseShouldFail(archive.load(), done, (error) => {
        stub.restore()
        context.expect(error.message).to.equal(Archive.ERRORS.CANNOT_LOAD('it does not exist'))
    })
}).

add('should not load an archive with invalid files', (context, done) => {
    const archive = new Archive({ dir: context.dir, id: 'invalid-archive', version: "1" })
    const stub = context.stub(npm, 'extract').callsFake(() => Promise.resolve({ version: "1" }))
    const stub2 = context.stub(npm, 'manifest').callsFake(() => Promise.resolve({ version: "1" }))

    savor.addAsset('assets/invalid-archive', 'invalid-archive/1', context)

    savor.promiseShouldFail(archive.load(), done, (error) => {
        stub.restore()
        stub2.restore()
        context.expect(error.message.startsWith(File.ERRORS.CANNOT_LOAD())).to.be.true
    })
}).

add('should load a valid archive', (context, done) => {
    const archive = new Archive({ dir: context.dir, id: 'test-archive', version: "1" })
    const stub = context.stub(npm, 'extract').callsFake(() => Promise.resolve({ version: "1" }))
    const stub2 = context.stub(npm, 'manifest').callsFake(() => Promise.resolve({ version: "1" }))

    savor.addAsset('assets/test-archive', 'test-archive/1', context)

    savor.promiseShouldSucceed(archive.load(), done, (output) => {
        stub.restore()
        stub2.restore()
        context.expect(archive.files.length).to.equal(8)
    })
}).

add('should download the latest version', (context, done) => {
    const archive = new Archive({ dir: context.dir, id: 'test-archive' })
    const stub = context.stub(npm, 'extract').callsFake(() => Promise.resolve({ version: "1" }))
    const stub2 = context.stub(npm, 'manifest').callsFake(() => Promise.resolve({ version: "1" }))

    savor.addAsset('assets/test-archive', 'test-archive/1', context)

    savor.promiseShouldSucceed(archive.download(), done, (output) => {
        context.expect(archive.version).to.equal('1')
        context.expect(archive.manifest.version).to.equal('1')
        stub.restore()
        stub2.restore()
    })
}).


run('[Rara] Archive')
