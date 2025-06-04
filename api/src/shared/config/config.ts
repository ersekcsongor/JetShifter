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
});

convict.addParser({ extension: ['yml', 'yaml'], parse: yaml.load });
const envFilePath = './.env.yml';
if (fs.existsSync(envFilePath)) {
  config.loadFile(envFilePath);
}
config.validate({ allowed: 'strict' });
