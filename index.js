const https = require('https');
const MD5 = require('./MD5');

module.exports = class CleverBot {
    constructor(opts={}) {
        this._weburl = opts.weburl || "https://www.cleverbot.com";
        this._messages = opts.messages || [];    
    };

    async _cookies() {
        return await new Promise((resolve, reject) => {
            let _request = https.get( "https://www.cleverbot.com", {method: 'HEAD'}, r => resolve(r.headers['set-cookie']));
            _request.on('error', (e) => reject(e));
        });
    };

    async _stimulate(message) {
        return escape(message).includes("%u") ? escape(escape(message).replace(/%u/g, "|")) : escape(message);
    };

    async _message(message) {
        let _messagesClone = this._messages.slice();
        let _payload = `stimulus=${this._stimulate(message)}&`;
        let _reverseMessages = _messagesClone.reverse();
        for (let _index in _reverseMessages) _payload += `vText${_index + 2}=${this._stimulate(_reverseMessages[_index])}&`;
        _payload += "cb_settings_scripting=no&islearning=1&icognoid=wsf&icognocheck=", _payload += MD5(_payload.substring(7, 33));
        return await new Promise(async (resolve, reject) => {
            let _req = https.request(this._weburl + "/webservicemin?uc=UseOfficialCleverbotAPI", {method: 'POST', headers: {'Cookie': await this._cookies(), 'content-type':'text/plain'}}, r => {resolve(decodeURIComponent(r.headers['cboutput']));r.on('error', (e) => reject(e))});
            _req.write(_payload);
            _req.end();
        });
    };

    async send(message, callback=null) {
        this._messages.push(message);
        let _res = this._message(message);
        if (callback) {
            callback(await _res);
        };
    };
};