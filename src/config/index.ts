import merge from 'lodash.merge';
import { prod } from './prod';
import { staging } from './staging';
import { local } from './local';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const stage = process.env.STAGE || 'local';

let envConfig;

if (stage === 'production') {
  envConfig = prod;
} else if (stage === 'staging') {
  envConfig = staging;
} else if (stage === 'local') {
  envConfig = local;
}

export default merge(
  {
    stage,
    env: process.env.NODE_ENV,
    port: 3000,
    dbUrl: process.env.DATABASE_URL,
    secrets: {
      jwt: process.env.JWT_SECRET,
    },
    omdbApiBaseUrl: process.env.OMDB_API_BASE_URL,
    omdbApiApiKey: process.env.OMDB_API_API_KEY,
  },
  envConfig
);
