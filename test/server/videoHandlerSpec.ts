/*
 * Focused tests for videoHandler fallback behavior
 */

import { expect } from 'chai'
import * as sinon from 'sinon'
const fs = require('fs')
const videoHandler = require('../../routes/videoHandler')

describe('videoHandler helpers', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('videoPath falls back to data/static when frontend assets are missing', () => {
    // Simulate frontend file missing and data/static present
    const existsStub = sinon.stub(fs, 'existsSync')
    existsStub.callsFake((p: string) => {
      if (p.indexOf('frontend/dist/frontend/assets/public/videos') >= 0) return false
      if (p.indexOf('data/static') >= 0) return true
      return false
    })

    const resolved = videoHandler.__test__.videoPath()
    expect(resolved).to.match(/data\/static\/.+owasp_promo.*\.mp4$/)
  })

  it('getSubsFromFile falls back to data/static when frontend assets are missing', () => {
    const existsStub = sinon.stub(fs, 'existsSync')
    existsStub.callsFake((p: string) => {
      if (p.indexOf('frontend/dist/frontend/assets/public/videos') >= 0) return false
      if (p.indexOf('data/static') >= 0) return true
      return false
    })

    // Also stub readFileSync to return known content when data/static is read
    const readStub = sinon.stub(fs, 'readFileSync')
    readStub.withArgs(sinon.match(/data\/static\/.*owasp_promo.*\.vtt$/), 'utf8').returns('WEBVTT\n\n00:00:00.000 --> 00:00:01.000\nHello')

    const subs = videoHandler.__test__.getSubsFromFile()
    expect(subs).to.contain('WEBVTT')

    readStub.restore()
  })
})
