import {
  createInvitationCode,
  hashInvitationCode,
  invitationExpired,
  normalizeInvitationCode,
} from './invitation'
describe('pairing invitations', () => {
  it('uses at least 128 bits with unambiguous random symbols and readable groups', () => {
    const code = createInvitationCode()
    expect(code.split('-')).toHaveLength(6)
    expect(normalizeInvitationCode(code)).toMatch(/^[2-9A-HJ-NP-Z]{30}$/)
  })
  it('hashes normalized values without retaining plaintext', async () => {
    expect(await hashInvitationCode('23456-789AB-CDEFG-HJKLM')).toMatch(/^[a-f0-9]{64}$/)
  })
  it('expires at ten minutes', () => {
    expect(invitationExpired(1000, 1000)).toBe(true)
    expect(invitationExpired(1001, 1000)).toBe(false)
  })
})
