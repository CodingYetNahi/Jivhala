import { locales, resources } from './resources'
describe('localization resources', () => {
  it('has a complete fallback-backed dictionary for every initial locale', () => {
    const keys = Object.keys(resources.en)
    for (const locale of locales) expect(Object.keys(resources[locale])).toEqual(keys)
  })
  it('uses native presentation for Marathi', () => {
    expect(resources.mr.marathiName).toBe('जिव्हाळा')
  })
})
