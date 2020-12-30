# Cleverbot

## Install

`npm install cleverbot-api-free`

## Usage

```js
const cleverbot = require("cleverbot-api-free");
const client = new cleverbot();

client.send("message", (response) => {
        console.log(response);
    },
);
```