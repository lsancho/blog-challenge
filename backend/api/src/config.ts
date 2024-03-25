import convict from 'convict'

convict.addFormats({
  base64: {
    validate: (val: any): void => {
      if (!val) throw new Error('value must be provided')
      if (typeof val !== 'string') throw new Error('value must be a string')
    },
    coerce: (val: any): any => {
      return Buffer.from(val, 'base64').toString('utf-8')
    }
  }
})

export default convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 8000,
    env: 'API_PORT'
  },
  paseto: {
    lifespan: {
      doc: 'The lifespan of the paseto token in milliseconds',
      format: Number,
      default: 2 * 60 * 1000,
      env: 'API_PASETO_LIFESPAN'
    },
    keys: {
      public: {
        doc: 'The public paseto key',
        format: 'base64',
        default: '',
        env: 'API_PASETO_PUBLIC_KEY'
      },
      private: {
        doc: 'The private paseto key',
        sensitive: true,
        format: 'base64',
        default: '',
        env: 'API_PASETO_PRIVATE_KEY'
      }
    }
  },
  postgres: {
    host: {
      doc: 'The postgres host.',
      format: '*',
      default: 'localhost',
      env: 'API_DATABASE_HOST'
    },
    port: {
      doc: 'The postgres port.',
      format: 'port',
      default: 5432,
      env: 'POSTGRES_PORT'
    },
    user: {
      doc: 'The postgres user.',
      format: String,
      default: 'postgres',
      env: 'POSTGRES_USER'
    },
    password: {
      doc: 'The postgres password.',
      format: String,
      default: 'postgres',
      env: 'POSTGRES_PASSWORD'
    },
    db: {
      doc: 'The postgres database.',
      format: String,
      default: 'postgres',
      env: 'POSTGRES_DB'
    }
  }
})
