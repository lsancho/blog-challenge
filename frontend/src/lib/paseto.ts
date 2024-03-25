export const decode = (token: string) => {
  if (typeof token !== 'string') {
    throw new TypeError('token must be a string')
  }

  const { 0: version, 1: purpose, 2: payload, 3: footer, length } = token.split('.')

  if (length !== 3 && length !== 4) {
    throw new PasetoInvalid('token is not a PASETO formatted value')
  }

  if (version !== 'v1' && version !== 'v2' && version !== 'v3' && version !== 'v4') {
    throw new PasetoNotSupported('unsupported PASETO version')
  }

  if (purpose !== 'local' && purpose !== 'public') {
    throw new PasetoNotSupported('unsupported PASETO purpose')
  }

  const result = {
    footer: footer ? Buffer.from(footer, 'base64') : undefined,
    payload: undefined,
    version,
    purpose
  }

  if (purpose === 'local') {
    return result
  }

  const sigLength = version === 'v1' ? 256 : version === 'v3' ? 96 : 64

  let raw
  try {
    console.log('payload', payload)
    raw = Buffer.from(payload, 'base64').subarray(0, -sigLength)
  } catch (error) {
    console.error(error)
    throw new PasetoInvalid('token is not a PASETO formatted value')
  }

  result.payload = parsePayload(raw)

  return result as {
    footer?: Buffer
    payload?: Record<string, string>
    version: string
    purpose: string
  }
}

class PasetoError extends Error {
  code = ''
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    this.code = CODES[this.constructor.name]
    Error.captureStackTrace(this, this.constructor)
  }
}

interface CodeMap {
  [key: string]: string
}

const CODES: CodeMap = {
  PasetoNotSupported: 'ERR_PASETO_NOT_SUPPORTED',
  PasetoDecryptionFailed: 'ERR_PASETO_DECRYPTION_FAILED',
  PasetoInvalid: 'ERR_PASETO_INVALID',
  PasetoVerificationFailed: 'ERR_PASETO_VERIFICATION_FAILED',
  PasetoClaimInvalid: 'ERR_PASETO_CLAIM_INVALID'
}
const PasetoNotSupported = class PasetoNotSupported extends PasetoError {}
const PasetoDecryptionFailed = class PasetoDecryptionFailed extends PasetoError {}
const PasetoInvalid = class PasetoInvalid extends PasetoError {}
const PasetoVerificationFailed = class PasetoVerificationFailed extends PasetoError {}
const PasetoClaimInvalid = class PasetoClaimInvalid extends PasetoError {}

const parsePayload = (payload: string | Buffer) => {
  try {
    const p = typeof payload === 'string' ? payload : payload.toString('utf-8')
    const parsed = JSON.parse(p)
    if (!isObject(parsed)) throw new PasetoInvalid('All PASETO payloads MUST be a JSON object')
    return parsed
  } catch {
    throw new PasetoInvalid('All PASETO payloads MUST be a JSON object')
  }
}

const isObject = (input: unknown) => !!input && input.constructor === Object
