# A library for Vkontakte API

## Getting started

```
npm install lp-vk
```

Then, use `require`:
```
const LP = require('lp-vk');
const lp = new LP({ token: '' }); // options
```

>If you need, you can put `group_id` in options.

Also, callback is possible
```
const lp = new LP({ token: '', callback: { confirmation: '' } | true }); //if no code, will get own from API
```

### Usage

>All events are from vk API

```
lp.on('message_new', handler); //function with only argument
```

Handler's argument is event, or if `message`, it is _message_'s  _object_

```
lp.start(options);
``` 
Will start polling and get `group_id` if needed.

#### Messages

```
message.send(text, params);
message.is_chat //bool
message.chat_id //id
message.sendPhotos(raw, params); //filenames
message.sendPhotosBuffer(raw, params); //buffers
message.sendStoryBuffer(rew, params); //buffers
message.sendDocuments(raw, params); //filenames
message.sendAudioMessage(raw, params); //filenames

message.sendSticker(id, params);
message.replySticker(id, params);
message.reply(text, params);
message.forward(peer_id, params|text);
message.edit(conversation_message_id, params|text);
message.delete(id, params);

message.removeChatUser(member_id, params|chat_id);
message.getConversation(peer_ids, params);

message.sendMessageEventAnswer(ans); //see vk api docs
```

## Methods
```
lp.api.method.do(params);
```

>Execute mode is on


## Class ApiError

```
error.msg = 'Param is invalid or empty';
error.code = 100;
error.params = {} | null;
error.toString() = 'Error 100 - Param is empty or invalid';
