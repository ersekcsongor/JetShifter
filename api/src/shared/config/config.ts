import * as convict from 'convict';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import 'dotenv/config';
interface Config {
  server: {
    port: number;
    runSeeders: boolean;
    debugMode: boolean;
    targetLanguage: string;
  };
  db: {
    url: string;
  };
  jwt_secret: string;
  firebase: {
    service_account: FirebaseServiceAccount;
    storage_bucket: string;
  };
  lufthansa_client_id: string;
  lufthansa_client_secret: string;
  enable_ryanair_api: boolean;
}

interface FirebaseServiceAccount{
  project_id: string;
  private_key: string;
  client_email: string;
}

export const config = convict<Config>({
  db: {
    url: {
      doc: 'The access url for mongodb',
      format: String,
      default: null,
      env: 'MONGO_DB_ACCESS_URL',
    },
  },
  jwt_secret: {
      doc: 'JWT signing key',
      format: String,
      default: 'your-default-secret-here', // For development only
      env: 'JWT_SECRET'
  },
  firebase: {
    service_account: {
      project_id: {
        doc: 'The GCP project ID for Firebase',
        format: String,
        default: '',
        env: 'FIREBASE_SERVICE_ACCOUNT_PROJECT_ID',
      },
      client_email: {
        doc: 'The service account client email',
        format: String,
        default: '',
        env: 'FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL',
      },
      private_key: {
        doc: 'The service account private key',
        format: String,
        default: '',
        // Env vars with newlines often need escaping
        env: 'FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY',
      },
    },
    // This is what you pass as storageBucket to admin.initializeApp()
    storage_bucket: {
      doc: 'Your Firebase Storage bucket name',
      format: String,
      default: '',
      env: 'FIREBASE_STORAGE_BUCKET',
    },
  },
    gemini_api_key: {
    doc: 'Google Gemini API Key',
    format: String,
    default: '',
    env: 'GEMINI_API_KEY',
    sensitive: true,
  },
  lufthansa_client_id: {
    doc: 'Lufthansa API Client ID',
    format: String,
    default: '',
    env: 'LUFTHANSA_CLIENT_ID',
  },
  lufthansa_client_secret: {
    doc: 'Lufthansa API Client Secret',
    format: String,
    default: '',
    env: 'LUFTHANSA_CLIENT_SECRET',
    sensitive: true,
  },
  enable_ryanair_api: {
    doc: 'Enable or disable Ryanair API flight fetching',
    format: Boolean,
    default: true,
    env: 'ENABLE_RYANAIR_API',
  },

});

convict.addParser({ extension: ['yml', 'yaml'], parse: yaml.load });
const envFilePath = './.env.yml';
if (fs.existsSync(envFilePath)) {
  config.loadFile(envFilePath);
}
config.validate({ allowed: 'strict' });
