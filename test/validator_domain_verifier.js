import ValidatorDomainVerifier from '../src'
import {InvalidRippleAccount, AccountDomainNotFound, InvalidDomain, RippleTxtNotFound, ValidationPublicKeyNotFound} from '../src/errors'
import assert from 'assert'

describe('ValidatorDomainVerifier', () => {

  describe('getDomainHashFromAddress', () => {

    it('should return a hash of a domain', async () => {

      let verifier = new ValidatorDomainVerifier()
      const address = 'ramcE1KE3gxHc8Yhs6hJtE55CrjkHUQyo'
      const domain = 'ripple.com'

      const domainHex = await verifier.getDomainHexFromAddress(address)
      assert.strictEqual(domain, ValidatorDomainVerifier._hexToString(domainHex))
    })
  })

  describe('getValidationPublicKeysFromDomain', () => {

    it('should return the validation public keys of domain\'s ripple.txt', async () => {

      let verifier = new ValidatorDomainVerifier()
      const domain = 'ripple.com'
      const validationPublicKey = 'n949f75evCHwgyP4fPVgaHqNHxUVN15PsJEZ3B3HnXPcPjcZAoy7'

      const validationPublicKeys = await verifier.getValidationPublicKeysFromDomain(domain)
      assert(validationPublicKeys.indexOf(validationPublicKey)!==-1)
    })

    it('should throw an InvalidDomain error', async () => {

      let verifier = new ValidatorDomainVerifier()
      const invalidDomain = 'notadomain'

      try {
        const validationPublicKeys = await verifier.getValidationPublicKeysFromDomain(invalidDomain)
      } catch(error) {
        assert(error instanceof InvalidDomain)
        assert.strictEqual(error.message, invalidDomain)
      }
    })

    it('should throw an RippleTxtNotFound error', async () => {

      let verifier = new ValidatorDomainVerifier()
      const domain = 'mises.org'

      try {
        const validationPublicKeys = await verifier.getValidationPublicKeysFromDomain(domain)
      } catch(error) {
        assert(error instanceof RippleTxtNotFound)
        assert.strictEqual(error.message, domain)
      }
    }).timeout(20000);

    it('should throw an ValidationPublicKeyNotFound error', async () => {

      let verifier = new ValidatorDomainVerifier()
      const domain = 'bitso.com'

      try {
        const validationPublicKeys = await verifier.getValidationPublicKeysFromDomain(domain)
      } catch(error) {
        assert(error instanceof ValidationPublicKeyNotFound)
        assert.strictEqual(error.message, domain)
      }
    })
  })

  describe('verifyValidatorDomain', () => {

    it('should find the validation public key at the account root\'s domain', async () => {

      const verifier = new ValidatorDomainVerifier()
      const validationPublicKey = 'n949f75evCHwgyP4fPVgaHqNHxUVN15PsJEZ3B3HnXPcPjcZAoy7'
      const domain = 'ripple.com'

      assert.strictEqual(domain, await verifier.verifyValidatorDomain(validationPublicKey))
    })

    it('should find the master validation public key at the ephemeral key\'s account root\'s domain', async () => {

      const verifier = new ValidatorDomainVerifier()
      const validationPublicKey = 'n9LYyd8eUVd54NQQWPAJRFPM1bghJjaf1rkdji2haF4zVjeAPjT2'
      const masterPublicKey = 'nHUkAWDR4cB8AgPg7VXMX6et8xRTQb2KJfgv1aBEXozwrawRKgMB'
      const domain = 'testnet.ripple.com'

      assert.strictEqual(domain, await verifier.verifyValidatorDomain(validationPublicKey, masterPublicKey))
    })

    it('should return error for missing account domain', async () => {

      const verifier = new ValidatorDomainVerifier()
      const validationPublicKey = 'n9KwwpYCU3ctereLW9S48fKjK4rcsvYbHmjgiRXkgWReQR9nDjCw'

      try {
        await verifier.verifyValidatorDomain(validationPublicKey)
      } catch(error) {
        assert(error instanceof AccountDomainNotFound)
      }
    })

    it('should return error for validation public not found at domain', async () => {

      const verifier = new ValidatorDomainVerifier()
      const validationPublicKey = 'n9KSFuD5s7jWvcsLEbKJv37kDX57RRR3wf3kS2ra8zedhMW27cN1'

      try {
        await verifier.verifyValidatorDomain(validationPublicKey)
      } catch(error) {
        assert(error instanceof ValidationPublicKeyNotFound)
      }
    })
  })

  describe('_validateRippleAddress', () => {

    it('should accept a valid ripple address', async () => {

      const address = 'ramcE1KE3gxHc8Yhs6hJtE55CrjkHUQyo'
      ValidatorDomainVerifier._validateRippleAddress(address)
    })

    it('should reject an invalid ripple address', async () => {

      let address = 'n949f75evCHwgyP4fPVgaHqNHxUVN15PsJEZ3B3HnXPcPjcZAoy7'
      try {
        ValidatorDomainVerifier._validateRippleAddress(address)
      } catch (error) {
        assert(error instanceof InvalidRippleAccount)
        assert.strictEqual(error.message, address)
      }
    })
  })

  describe('_validateDomain', () => {

    it('should accept a valid domain', async () => {

      const domain = 'ripplelabs.com'
      ValidatorDomainVerifier._validateDomain(domain)
    })

    it('should reject an invalid domain', async () => {

      const domain = 'ripple!!'
      try {
        ValidatorDomainVerifier._validateDomain(domain)
      } catch (error) {
        assert(error instanceof InvalidDomain)
        assert.strictEqual(error.message, domain)
      }
    })
  })

  describe('_hexToString', () => {

    it('convert hex to ascii string', async () => {
      const hex = '726970706C652E636F6D'
      const str = 'ripple.com'
      assert.strictEqual(str, ValidatorDomainVerifier._hexToString(hex))
    })
  })
})

