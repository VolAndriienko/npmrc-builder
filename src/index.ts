import { readFileSync, appendFileSync } from 'fs';
import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: false });

let libraryPath = './';
try {
  const angularJson = JSON.parse(readFileSync('angular.json', 'utf-8'));
  const lib: any = Object.values(angularJson.projects)
    .find((project: any) => project.projectType === 'library')

  libraryPath = lib.root + '/';
} catch {
  console.warn('Error while parsing angular.json, library path is not found')
}

const libPackageJson = JSON.parse(readFileSync(`${libraryPath}package.json`, 'utf-8'));

const libRegistryUrl = libPackageJson.publishConfig ? libPackageJson.publishConfig.registry : null;
const libScope = libPackageJson.name.split('/').reverse().slice(1).reverse().join('');

const questions = ['Enter user name', 'Enter password', 'Enter registry url', 'Enter scope'];
const answersMap = ['userName', 'password', 'customRegistryUrl', 'customScope'];
const answersMapCopy = JSON.parse(JSON.stringify(answersMap));

const defaultValues = [null, null, libRegistryUrl, libScope];
const input = {};

answersMap.forEach(answer => input[answer] = '');

function askQuestions(questions: string[]) {
  if (questions && questions.length) {
    rl.question(`\n${questions.shift()}, default is ${defaultValues.shift() || 'missing'}:\n`, answer => {
      input[answersMap.shift()] = answer;

      askQuestions(questions);
    });
  } else {
    createNpmrc();
    rl.close();

    process.exit();
  }
}

function getScope(scopeValue: string): string {
  let scope = '';
  if (scopeValue) {
    if (!scopeValue.startsWith('@')) {
      scopeValue = '@' + scopeValue;
    }
    scope = `${scopeValue}:`;
  }

  return scope;
}

function getRegistryUrl(registryUrlValue: string): string {
  const registryUrl = registryUrlValue.split('//').pop();

  return registryUrl
}

function getProtocol(registryUrlValue: string): string {
  const protocol = (registryUrlValue.indexOf('://') > -1 ? registryUrlValue.split('//').shift() : 'http:') + '//';

  return protocol;
}

function getAuthToken(userName: string, password: string): string {
  const authToken = Buffer.from(`${userName}:${password}`).toString('base64');;

  return authToken;
}

function getNpmrcFileText({ registryUrl, scope, authToken, protocol }) {
  const result = `//${registryUrl}:always-auth=true
//${registryUrl}:_auth=${authToken}
${scope}registry=${protocol}${registryUrl}`;

  return result;
}

function createNpmrc() {
  const getNextInputValue = () => input[answersMapCopy.shift()];
  const userName = getNextInputValue();
  const password = getNextInputValue();
  const customRegistryUrl = getNextInputValue();
  const customScope = getNextInputValue();

  const scopeValue = customScope || libScope;
  const registryUrlValue = customRegistryUrl || libRegistryUrl;
  const isUserNameAndPassword = !!userName && !!password;

  if (!scopeValue) {
    console.log('Scope was not specified')
  }

  if (!registryUrlValue) {
    console.error('No registry url specified');
  }
  else if (!isUserNameAndPassword) {
    console.error('Error. Please specify username and password as arguments.');
  }
  else {
    const scope = getScope(scopeValue);
    const registryUrl = getRegistryUrl(registryUrlValue);
    const protocol = getProtocol(registryUrlValue);
    const authToken = getAuthToken(userName, password);
    const text = getNpmrcFileText({ scope, registryUrl, protocol, authToken });

    appendFileSync(`${libraryPath}.npmrc`, text, { flag: 'w' });
    console.log('\nAuth token is created\n.npmrc is created\nExiting, good luck...\n');
  }
}

export const start = () => askQuestions(questions);