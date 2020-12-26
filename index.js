const superagent = require("superagent");
const md5 = require("md5");

module.exports = class CleverBot {
    constructor(opts={}) {
        this._weburl = opts.weburl || "https://www.cleverbot.com";
        this._messages = opts.messages || [];    
        this._cookie = this._cookies();
    };

    async _cookies() {
        let _req = await superagent.get(this._weburl);
        return _req.headers["set-cookie"];
    };

    async _stimulate(message) {
        return escape(message).includes("%u") ? escape(escape(message).replace(/%u/g, "|")) : escape(message);
    };

    async _message(message) {
        let _messagesClone = this._messages.slice();
        let _payload = `stimulus=${this._stimulate(message)}&`;
        let _reverseMessages = _messagesClone.reverse();
        for (let _index in _reverseMessages) _payload += `vText${_index + 2}=${this._stimulate(_reverseMessages[_index])}&`;
        _payload += "cb_settings_scripting=no&islearning=1&icognoid=wsf&icognocheck=", _payload += md5(_payload.substring(7, 33));
        let _req = superagent.post(this._weburl + "/webservicemin?uc=UseOfficialCleverbotAPI")
        .set("Cookie", await this._cookie).type("text/plain").send(_payload);
        return decodeURIComponent((await _req).header["cboutput"]);
    };

    async send(message, callback=null) {
        let _res = this._message(message);
        if (callback) {
            callback(await _res);
        };
    };
};