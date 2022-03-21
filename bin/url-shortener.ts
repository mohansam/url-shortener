#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { UrlShortenerStack } from '../lib/url-shortener-stack';

const app = new cdk.App();
const env: cdk.Environment = {
  region: 'ap-south-1',
  account:'869676766009'
}
new UrlShortenerStack(app, 'UrlShortenerStack', {
  description: 'this stack will deploy url shortener website',
  tags: {
    Name:'url shortener'
  },
  env: env,
  certificateARN: 'arn:aws:acm:us-east-1:869676766009:certificate/b801626d-b0ac-46e3-adcb-0f2bba7b1267',
  cfDomainName:'test.chotta.in'
});