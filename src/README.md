# npmrc-builder

This library helps to create correct **`.npmrc`** file for publish process.

It creates _auth token, generated from **username:password** string.

It also can read the `angular.json` and `package.json` files of angular library.

This need to read **name**, **scope** and **registry** from _publishConfig_ property as default values.

Also, after running lib from entrypoint a developer will be able to specify custom **registry** or **scope** values.

Approximate result is **`.npmrc`** file with next content:

```
//registryLink.com:always-auth=true
//registryLink.com:_auth=base64stringOfUsernameAndPassword
@scope:registry=http://registryLink.com
```

Http protocol and scope @ prefix can be skipped or added, doesn't matter.

## 

## Usage

To install please run:
```
npm i -D npmrc-builder
```

The library can be used in .js or .ts files. The main point is to use it in the root folder of the project.

### Typescript usage

Create file npmrc-builder.ts with next code:

```
import { start } from 'npmrc-builder'
start();
```

And then inside the `package.json` add next script:

```
nodemon npmrc-builder.ts
```

Please check info about [nodemon](https://www.npmjs.com/package/nodemon), if you have no idea about it.

>Warning

Also, you can see next error after running script:

```
Typescript: Cannot use import statement outside a module
```

Most possibly you have `tsconfig.json` in root folder with incorrect settings for this library.

There are 2 quick options in this case - **use Javascript version** or **remove/rename/change** `tsconfig.json`.

### Javascript usage 

Create file npmrc-builder.js with next code:

```
const builder = require('npmrc-builder');
builder.start();
```

And then inside the `package.json` add next script:

```
node npmrc-builder.js
```

I think, if you are here, you know what the **node** is.

## After running script

You will be prompted to enter `username`, `password`, `registry` and `scope`. 

The result is generated .npmrc file inside the library or in the root of project if library doesn't exist.

>To avoid using any registry even, default one, type any 1 symbol as answer for question about registry URL (the same works for scope as well).

>To use https://registry.npmjs.org as registry URL - type `npm` as answer.