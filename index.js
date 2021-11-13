const async = require('async');
const fs = require("fs");
const https = require("https");
var stream = require('stream');
var req = require('req-fast');
const nano = require('nano-time').micro;
const FormData = require('form-data');
var agent = new https.Agent;
agent.maxSockets = 1;
function qw(obj) {
  return obj instanceof stream.Stream &&
    typeof (obj._read === 'function') &&
    typeof (obj._readableState === 'object');
}

//let fetch = require('node-fetch');
//import { fetch } from 'node-fetch';
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
class lp {
	constructor (options = {}) {
		this.api = new api(options);
		this.callback = options.callback || false;
		this.app = options.app;
		this.a= null;
		this.spisok = {};
		return this;
	};
	setOptions (options = {}) {
		Object.assign(this.api.options, options);
		return this;
	};
	stop () {
		this.api.options.started = false;
		server.close();
		return this;
	};
	get isStarted () {
		return this.api.options.started;
	};
	async start (options = {}) {
		try {
		Object.assign(this.api.options, options);
		this.api.options.started = true;
		if(this.api.options.group_id) {
			console.log("group, id"+this.api.options.group_id);
			if(this.api.options.user) return this.groupUser(this.api.options.token, this.api.options.group_id).catch(e=>{throw e});
			this.ao(this.api.options.token, this.api.options.group_id).catch(e => {throw e});
		} else if (this.api.options.user_id) {
			console.log("user, id"+this.api.options.user_id);
			this.user(this.api.options.token, this.api.options.user_id).catch(e => {throw e});
		} else {
			let group = {};
			try {
				group = (await this.api.call("groups.getById"))[0];
			} catch(e) {
				if(e.code != 100) throw e;
			}
			if(group.id) {
				this.api.options.group_id = group.id;
				console.log("group, id"+this.api.options.group_id);
				if(this.api.options.user) return this.groupUser(this.api.options.token, this.api.options.group_id).catch(e=>{throw e});
				this.ao(this.api.options.token, this.api.options.group_id).catch(e => {throw e}); 
			} else {
					let group = {};
				try {
					group = (await this.api.call("users.get"))[0];
				} catch(e) {
					if(e.code != 100) throw e;
				}
				if(group.id) {
					this.api.options.user_id = group.id;
					console.log("user, id"+this.api.options.user_id);
					this.user(this.api.options.token, this.api.options.user_id).catch(e => {throw e}); 
				} else throw RangeError('Token is not from user nor group');
			}
		}
		
		this.setDebug(false);
		} catch (e) {
			this.api.options.started = false;
			throw e;
		}
	};
async getId (options = {}) {
		try {
		Object.assign(this.api.options, options);
		if(this.api.options.group_id) {
			console.log("group, id"+this.api.options.group_id);
			return -this.api.options.group_id;
		} else if (this.api.options.user_id) {
			console.log("user, id"+this.api.options.user_id);
			return this.api.options.user_id;
		} else {
			let group = {};
			try {
				group = (await this.api.call("groups.getById"))[0];
			} catch(e) {
				if(e.code != 100) throw e;
			}
			if(group.id) {
				this.api.options.group_id = group.id;
				console.log("group, id"+this.api.options.group_id);
				return -this.api.options.group_id;
			} 
			else {
				let group = {};
				try {
					group = (await this.api.call("users.get"))[0];
				} catch(e) {
					if(e.code != 100) throw e;
				}
				if(group.id) {
					this.api.options.user_id = group.id;
					console.log("user, id"+this.api.options.user_id);
					return this.api.options.user_id;
				} else throw RangeError('Token is not from user nor group');
			}
		}
		} catch (e) {
			this.api.options.started = false;
			throw e;
		}
	};

	on (type, callback) {
		this.spisok[type] = callback;
	};
	setDebug (a) {
		this.spisok["debug"] = (a) ? (async (a) => {console.log(a)}) : null;
	};
async ao (token, group_id) {
	if(this.callback) {
		
	} else {
		this.a = await this.api.call("groups.getLongPollServer",{}).catch(e => { throw new Error("No rights to get lp server") });
		this.startlp(token, group_id);
	}
}

async user (token, user_id) {
	if(this.callback) {
		throw TypeError('No callback possible for user, disable it') 
	} else {
		this.a = await this.api.call("messages.getLongPollServer",{ lp_version: 3 }).catch(e => { throw new Error("No rights to get lp server") });
		this.startUser(token, user_id);
	}
}
async groupUser (token, user_id) {
	if(this.callback) {
		throw TypeError('No callback possible for Group_user, disable it') 
	} else {
		this.a = await this.api.call("messages.getLongPollServer",{ lp_version: 3 }).catch(e => { throw new Error("No rights to get lp server") });
		this.startGroupUser(token, user_id);
	}
}
async startlp(token, group_id) {
	if(!this.api.options.started) return this.errored ? (this.start()) : false;
	var agent = new https.Agent;
agent.maxSockets = 1;
let t = this;
console.log(this.a);
function work() {
  var options = {
      method: 'GET',
      agent: agent
  };
  var req = https.request(`${/https:\/\//i.test(t.a.server) ? t.a.server: 'https://'+t.a.server}?act=a_check&key=${t.a.key}&ts=${t.a.ts}&wait=10&mode=10` , options, function(res) {
    if (res.statusCode != 200) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      process.exit(1)
    }
    res.setEncoding('utf8');
    let str = '';

  //another chunk of data has been received, so append it to `str`
  res.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been received, so we just print it out here
  res.on('end', function () {

    let updates = JSON.parse(str);
		if(updates.failed) {
			if(updates.failed == 1) {
				t.a.ts = updates.ts;
				return t.startlp(token, group_id);
			} else return t.ao(token, group_id);
		}
t.a.ts = updates.ts;

async.map(updates.updates, async (e,a) => { return t.handleUpdate({...e, start: nano() }); }, work);

  });
});
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
    process.exit(1);
  });
  req.end();
}

	
work()
}
async startUser(token, user_id) {
	if(!this.api.options.started) return this.errored ? (this.start()) : false;
	req({ url: `${/https:\/\//i.test(this.a.server) ? this.a.server : 'https://'+this.a.server}?act=a_check&key=${this.a.key}&ts=${this.a.ts}&wait=5&mode=138`, disableGzip: false, timeout: 8000}, async (err, resp) => {
		if(err) { 
			return this.startUser(token, user_id)
			//throw err;
		}
		let updates = resp.body;
		if(updates.failed) {
			if(updates.failed == 1) {
				this.a.ts = updates.ts;
				return this.startUser(token, user_id);
			} else return this.user(token, user_id);
		}
this.a.ts = updates.ts;
for(let i = 0; i < updates.updates.length; i++) {
	if(!Object.keys(this.spisok).includes(updates.updates[i][0].toString())) {
		console.log(updates.updates[i], updates.updates[i][6])
		continue;
	}
	let upd = updates.updates[i];
	if(upd[0] == 4) {
	upd = {
		type: 4,
		object: { message: {
			id: upd[1],
			flags: upd[2],
			peer_id: upd[3],
			date: upd[4],
			chat_name: upd[5],
			text: upd[6].toString(),
			from_id: upd[7].from || (Boolean(upd[2] & 2) ? this.api.options.user_id : upd[3]),
			out: Boolean(upd[2] & 2),
			important: Boolean(upd[2] & 8),
			random_id: upd[8] || null,
			raw: upd, 
			send: async (text, params) => {
				if(typeof text == 'object' && !text.message && !text.attachment && !text.forward) text = JSON.stringify(text, null, '\t');
				return this.api.messages.send({ peer_id: upd.object.message.peer_id, random_id: 0, ...(typeof text !== 'object' ? { message: text, ...params } : text), ...params });
			},
			edit: async (text = "&#13;", params = {}) => {
				return this.api.call("messages.edit",{ peer_id: upd.object.message.peer_id, message_id: upd.object.message.id, message: text, ...(typeof params == "object" ? params : { message_id: params })  });
			},
			sendPhotosBuffer: async (raw, params) => {
		raw = !Array.isArray(raw) ? [raw] : raw;

		let a = await this.api.call("photos.getMessagesUploadServer",{ peer_id: upd.object.message.peer_id });
		const attachment = await Promise.all(raw.map(async x => {
			return new Promise(async (resolve) => {
				const form = new FormData();			
				let read = (x);
				form.append("photo", read, { filename : 'upload.png', contentType: 'image/png' });
				await fetch(a.upload_url, { method: 'POST', body: form }).then(res => res.json()).then(async ans => {
					ans = (await this.api.call("photos.saveMessagesPhoto",ans))[0];
					resolve("photo"+ans.owner_id+"_"+ans.id+",");
				})
			})
		}));
		return this.api.call("messages.send",{ peer_ids: upd.object.message.peer_id, random_id: 0, ...params, attachment })
		},
		uploadPhotosBuffer: async (raw) => {
		return new Promise(async (resolve,reject) => {
		raw = !Array.isArray(raw) ? [raw] : raw;
		if(raw.length > 10) throw new RangeError('only 10 photos per message allowed')
		let a = await this.api.call("photos.getMessagesUploadServer");
		let form = new FormData();
		let i = 0;
		let temp = raw.splice(0,5);
		let attachment = '';
		temp.map(async x => {		
			i++;
			form.append("file"+i, x, { filename : 'upload'+(i)+'.png' });
		});
		await fetch(a.upload_url, { method: 'POST', body: form }).then(res => res.json()).then(async ans => {
					ans = (await this.api.call("photos.saveMessagesPhoto",ans))
					ans = ans.map(x=>'photo'+x.owner_id+'_'+x.id).join(',');
					attachment += ans;
			if(!raw.length) return resolve(attachment);
		i = 0;
		let b = await this.api.call("photos.getMessagesUploadServer");
		form = new FormData();
raw.map(async x => {		
			i++;
				form.append("file"+i, x, { filename : 'upload'+(i)+'.png', contentType: 'image/png' });
		})
		fetch(b.upload_url, { method: 'POST', body: form }).then(res => res.json()).then(async ans => {
					ans = (await this.api.call("photos.saveMessagesPhoto",ans)).map(x=>'photo'+x.owner_id+'_'+x.id).join(',');
					attachment += ans;
					return resolve(attachment);	
				})
						
				})
		
		})
	},
	delete: async (id = upd.object.message.id, params = {}) => {
		return this.api.call("messages.delete",{ message_ids: id, delete_for_all: true, random_id: 0, ...params  });
	},
		sendAudioMessage: async (raw, params) => {
		raw = !Array.isArray(raw) ? [raw] : raw;
		let a = await this.api.call("docs.getMessagesUploadServer",{ peer_id: upd.object.message.peer_id, type: "audio_message" });
		const attachment = await Promise.all(raw.map(async x => {
			return new Promise(async (resolve) => {
				const form = new FormData();
				let read = Buffer.isBuffer(x) ? x : (await fs.createReadStream(x));
				form.append("file", read, { filename: 'upload.ogg' });
				await fetch(a.upload_url, { method: 'POST', timeout: 0, headers: {}, body: form }).then(res => res.json()).then(async ans => {
					ans = (await this.api.call("docs.save",ans));
					resolve(ans.type+ans[ans.type].owner_id+"_"+ans[ans.type].id+",");
				})
			})
		}));
		return this.api.call("messages.send",{ peer_ids: upd.object.message.peer_id, random_id: 0, ...params, attachment })
	}
		} }
	}
	} else if(upd[0] == 52) {
		upd = {
			type: upd[0],
			object: {
				type: upd[1],
				peer_id: upd[2],
				info: upd[3],
				send: async (text, params) => {
				if(typeof text == 'object' && !text.message && !text.attachment && !text.forward) text = JSON.stringify(text, null, '\t');
				return this.api.messages.send({ peer_id: upd.object.peer_id, random_id: 0, ...(typeof text !== 'object' ? { message: text, ...params } : text), ...params });
			},
			}
		}
	} else {
		upd = {
			type: upd[0],
			object: upd
		}
	}
	this.spisok[upd.type]({...upd.object, start: nano()});//*/
}
this.startUser(token, user_id);
});

}
async startGroupUser(token, user_id) {
	if(!this.api.options.started) return this.errored ? (this.start()) : false;
	//console.log(this.a);
	req({ url: `${/https:\/\//i.test(this.a.server) ? this.a.server : 'https://'+this.a.server}?act=a_check&key=${this.a.key}&ts=${this.a.ts}&wait=29&mode=138&version=4`, disableGzip: false}, async (err, resp) => {
		if(err) { 
			this.startGroupUser(token, user_id)
			throw err;
		}
		let updates = resp.body;
		if(updates.failed) {
			if(updates.failed == 1) {
				this.a.ts = updates.ts;
				return this.startGroupUser(token, user_id);
			} else return this.groupUser(token, user_id);
		}
this.a.ts = updates.ts;
for(let i = 0; i < updates.updates.length; i++) {
	if(!Object.keys(this.spisok).includes(updates.updates[i][0].toString())) {
		console.log(updates.updates[i], updates.updates[i][6])
		continue;
	}
	let upd = updates.updates[i];
	
	if(upd[0] == 4) {
	upd = {
		type: 4,
		object: { message: {
			id: upd[1],
			flags: upd[2],
			peer_id: upd[3],
			date: upd[4],
			text: upd[5],
			chat_name: upd[6].title,
			from_id: upd[7].from || (Boolean(upd[2] & 2) ? this.api.options.user_id : upd[3]),
			out: Boolean(upd[2] & 2),
			important: Boolean(upd[2] & 8),
			random_id: upd[8] || null,
			raw: upd, 
			send: async (text, params) => {
				if(typeof text == 'object' && !text.message && !text.attachment && !text.forward) text = JSON.stringify(text, null, '\t');
				return this.api.messages.send({ peer_ids: upd.object.message.peer_id, random_id: 0, ...(typeof text !== 'object' ? { message: text, ...params } : text), ...params });
			},
			edit: async (text = "&#13;", params = {}) => {
				return this.api.call("messages.edit",{ peer_id: upd.object.message.peer_id, /*message_id: upd.object.message.id,*/ message: text, ...(typeof params == "object" ? params : { message_id: params })  });
			},
			sendPhotosBuffer: async (raw, params) => {
		raw = !Array.isArray(raw) ? [raw] : raw;

		let a = await this.api.call("photos.getMessagesUploadServer",{ peer_id: upd.object.message.peer_id });
		const attachment = await Promise.all(raw.map(async x => {
			return new Promise(async (resolve) => {
				const form = new FormData();			
				let read = (x);
				form.append("photo", read, { filename : 'upload.png', contentType: 'image/png' });
				await fetch(a.upload_url, { method: 'POST', body: form }).then(res => res.json()).then(async ans => {
					ans = (await this.api.call("photos.saveMessagesPhoto",ans))[0];
					resolve("photo"+ans.owner_id+"_"+ans.id+",");
				})
			})
		}));
		return this.api.call("messages.send",{ peer_ids: upd.object.message.peer_id, random_id: 0, ...params, attachment })
		},
		uploadPhotosBuffer: async (raw) => {
		return new Promise(async (resolve,reject) => {
		raw = !Array.isArray(raw) ? [raw] : raw;
		if(raw.length > 10) throw new RangeError('only 10 photos per message allowed')
		let a = await this.api.call("photos.getMessagesUploadServer");
		let form = new FormData();
		let i = 0;
		let temp = raw.splice(0,5);
		let attachment = '';
		temp.map(async x => {		
			i++;
			form.append("file"+i, x, { filename : 'upload'+(i)+'.png' });
		});
		await fetch(a.upload_url, { method: 'POST', body: form }).then(res => res.json()).then(async ans => {
					ans = (await this.api.call("photos.saveMessagesPhoto",ans))
					ans = ans.map(x=>'photo'+x.owner_id+'_'+x.id).join(',');
					attachment += ans;
			if(!raw.length) return resolve(attachment);
		i = 0;
		let b = await this.api.call("photos.getMessagesUploadServer");
		form = new FormData();
raw.map(async x => {		
			i++;
				form.append("file"+i, x, { filename : 'upload'+(i)+'.png', contentType: 'image/png' });
		})
		fetch(b.upload_url, { method: 'POST', body: form }).then(res => res.json()).then(async ans => {
					ans = (await this.api.call("photos.saveMessagesPhoto",ans)).map(x=>'photo'+x.owner_id+'_'+x.id).join(',');
					attachment += ans;
					return resolve(attachment);	
				})
						
				})
		
		})
	},
	delete: async (id = upd.object.message.id, params = {}) => {
		return this.api.call("messages.delete",{ message_ids: id, delete_for_all: true, random_id: 0, ...params  });
	},
		sendAudioMessage: async (raw, params) => {
		raw = !Array.isArray(raw) ? [raw] : raw;
		let a = await this.api.call("docs.getMessagesUploadServer",{ peer_id: upd.object.message.peer_id, type: "audio_message" });
		const attachment = await Promise.all(raw.map(async x => {
			return new Promise(async (resolve) => {
				const form = new FormData();
				let read = Buffer.isBuffer(x) ? x : (await fs.createReadStream(x));
				form.append("file", read, { filename: 'upload.ogg' });
				await fetch(a.upload_url, { method: 'POST', timeout: 0, headers: {}, body: form }).then(res => res.json()).then(async ans => {
					ans = (await this.api.call("docs.save",ans));
					resolve(ans.type+ans[ans.type].owner_id+"_"+ans[ans.type].id+",");
				})
			})
		}));
		return this.api.call("messages.send",{ peer_ids: upd.object.message.peer_id, random_id: 0, ...params, attachment })
	}
		} }
	}
	} else if(upd[0] == 52) {
		upd = {
			type: upd[0],
			object: {
				type: upd[1],
				peer_id: upd[2],
				info: upd[3],
				send: async (text, params) => {
				if(typeof text == 'object' && !text.message && !text.attachment && !text.forward) text = JSON.stringify(text, null, '\t');
				return this.api.messages.send({ peer_id: upd.object.peer_id, random_id: 0, ...(typeof text !== 'object' ? { message: text, ...params } : text), ...params });
			},
			}
		}
	} else {
		upd = {
			type: upd[0],
			object: upd
		}
	}
	console.log(upd.object.message, upd.object.message.raw[6])
	this.spisok[upd.type]({...upd.object, start: nano()});//*/
}
this.startGroupUser(token, user_id);
});
}
async handleUpdate(upd) {
	//console.log(upd)
if(!this.spisok[upd.type]) return console.log(upd);
if(this.api.options.secret && (Array.isArray(this.api.options.secret) ? (!this.api.options.secret.includes(upd.secret)) : (this.api.options.secret != upd.secret))) throw new Error("Secret mismatch");
if(upd.type == 'message_new' || upd.type == 'message_edit' || upd.type == 'message_reply') {
	if(!upd.object.message) console.log(upd.object)
	upd.object.start = upd.start;
	upd.object.message.send = async (text, params) => {
		if(typeof text == 'object' && !text.message && !text.attachment && !text.forward) text = JSON.stringify(text, null, '\t');
		return this.api.messages.send({ peer_ids: upd.object.message.peer_id, random_id: 0, ...(typeof text !== 'object' ? { message: text, ...params } : text), ...params });
	};
	upd.object.message.is_chat = upd.object.message.from_id != upd.object.message.peer_id;
	upd.object.message.chat_id = upd.object.message.is_chat ? (upd.object.message.peer_id - 2000000000) : null;
	upd.object.message.sendPhotos = async (raw, params) => {
		raw = !Array.isArray(raw) ? [raw] : raw;
		let a = await this.api.call("photos.getMessagesUploadServer",{ peer_id: upd.object.message.peer_id });
		const attachment = await Promise.all(raw.map(async x => {
			return new Promise(async (resolve) => {
				const form = new FormData();			
				let read = (await fs.createReadStream(x));
				form.append("photo", read);
				await fetch(a.upload_url, { method: 'POST', body: form }).then(res => res.json()).then(async ans => {
					ans = (await this.api.call("photos.saveMessagesPhoto",ans))[0];
					resolve("photo"+ans.owner_id+"_"+ans.id+",");
				})
			})
		}));
		return this.api.call("messages.send",{ peer_ids: upd.object.message.peer_id, random_id: 0, ...params, attachment })
	};
	upd.object.message.sendPhotosBuffer = async (raw, params) => {
		return new Promise(async (resolve,reject) => {
		upd.object.message.uploadPhotosBuffer(raw).then(e=>resolve(upd.object.message.send({...params,attachment:e})));
	})
	};
	upd.object.message.uploadPhotosBuffer = async (raw) => {
		return new Promise(async (resolve,reject) => {
		raw = !Array.isArray(raw) ? [raw] : raw;
		if(raw.length > 10) throw new RangeError('only 10 photos per message allowed')
		let a = await this.api.call("photos.getMessagesUploadServer");
		let form = new FormData();
		let i = 0;
		let temp = raw.splice(0,5);
		let attachment = '';
		temp.map(async x => {		
			i++;
			form.append("file"+i, x, { filename : 'upload'+(i)+'.png' });
		});
		await fetch(a.upload_url, { method: 'POST', body: form }).then(res => res.json()).then(async ans => {
					ans = (await this.api.call("photos.saveMessagesPhoto",ans))
					console.log(ans)
					ans = ans.map(x=>'photo'+x.owner_id+'_'+x.id).join(',');
					attachment += ans;
			if(!raw.length) return resolve(attachment);
		i = 0;
		let b = await this.api.call("photos.getMessagesUploadServer").catch(reject);
		form = new FormData();
raw.map(async x => {		
			i++;
				form.append("file"+i, x, { filename : 'upload'+(i)+'.png', contentType: 'image/png' });
		})
		fetch(b.upload_url, { method: 'POST', body: form }).then(res => res.json()).then(async ans => {
					ans = (await this.api.call("photos.saveMessagesPhoto",ans).catch(reject)).map(x=>'photo'+x.owner_id+'_'+x.id).join(',');
					attachment += ans;
					return resolve(attachment);	
				})
						
				})
		
		})
	};
	upd.object.message.sendStoryBuffer = async (raw, params) => {
		raw = !Array.isArray(raw) ? [raw] : raw;
		let a = await this.api.call("stories.getPhotoUploadServer",{ add_to_news: 0, access_token: 'f01faaf080c4888e2b346be64853648ae5d62dcdbdf68a268e9309bf27cb4039a30a793d60cbc7fd77d41' });
		const attachment = await Promise.all(raw.map(async x => {
			return new Promise(async (resolve) => {
				const form = new FormData();			
				let read = (x);
				form.append("file", read, { filename : 'upload.jpg' });
				await fetch(a.upload_url, { method: 'POST', body: form }).then(res => res.json()).then(async ans => {
					console.log(ans)
					ans = (await this.api.call("stories.save",{ upload_results: ans.response.upload_result, access_token: 'f01faaf080c4888e2b346be64853648ae5d62dcdbdf68a268e9309bf27cb4039a30a793d60cbc7fd77d41'})).items[0];
					resolve("story"+ans.owner_id+"_"+ans.id+",");
				})
			})
		}));
		return this.api.call("messages.send",{ peer_ids: upd.object.message.peer_id, random_id: 0, ...params, attachment })
	};
	upd.object.message.sendDocuments = async (raw, params) => {
		raw = !Array.isArray(raw) ? [raw] : raw;
		let a = await this.api.call("docs.getMessagesUploadServer",{ peer_id: upd.object.message.peer_id });
		const attachment = await Promise.all(raw.map(async x => {
			return new Promise(async (resolve) => {
				const form = new FormData();
				let read = await fs.createReadStream(x);
				form.append("file", read);
				await fetch(a.upload_url, { method: 'POST', timeout: 0, body: form }).then(res => res.json()).then(async ans => {
					let name = x.split("/").length;
					ans = (await this.api.call("docs.save",{ ...ans, title: x.split("/")[name]  }));
					console.log(ans)
					resolve(ans.type+ans[ans.type].owner_id+"_"+ans[ans.type].id+",");
				})
			})
		}));
		return this.api.call("messages.send",{ peer_ids: upd.object.message.peer_id, random_id: 0, ...params, attachment })
	};
	upd.object.message.sendAudioMessage = async (raw, params) => {
		raw = !Array.isArray(raw) ? [raw] : raw;
		let a = await this.api.call("docs.getMessagesUploadServer",{ peer_id: upd.object.message.peer_id, type: "audio_message" });
		const attachment = await Promise.all(raw.map(async x => {
			return new Promise(async (resolve) => {
				const form = new FormData();
				let read = Buffer.isBuffer(x) ? x : (await fs.createReadStream(x));
				form.append("file", read, { filename: 'upload.ogg' });
				await fetch(a.upload_url, { method: 'POST', timeout: 0, headers: {}, body: form }).then(res => res.json()).then(async ans => {
					ans = (await this.api.call("docs.save",ans));
					resolve(ans.type+ans[ans.type].owner_id+"_"+ans[ans.type].id+",");
				})
			})
		}));
		return this.api.call("messages.send",{ peer_ids: upd.object.message.peer_id, random_id: 0, ...params, attachment })
	};
	upd.object.message.sendPhoto = async (raw, params = {}) => {
		return upd.object.message.sendPhotos(raw, params);
	};
	upd.object.message.sendSticker = async (id, params = {}) => {
		return this.api.messages.send({ peer_ids: upd.object.message.peer_id, random_id: 0, ...params, sticker_id: id });
	};
	upd.object.message.replySticker = async (id) => {
		return this.api.call("messages.send",{ peer_ids: upd.object.message.peer_id, random_id: 0, forward: JSON.stringify({ peer_id: upd.object.message.peer_id, conversation_message_ids: upd.object.message.conversation_message_id, is_reply: 1 }), sticker_id: id });
	};
	upd.object.message.reply = async (text, params = {}) => {
		if(typeof text == 'object' && !text.message && !text.attachment) text = JSON.stringify(text, null, '\t');
		return this.api.call("messages.send",{ peer_ids: upd.object.message.peer_id, random_id: 0, forward: JSON.stringify({ peer_id: upd.object.message.peer_id, conversation_message_ids: upd.object.message.conversation_message_id, is_reply: 1 }), ...(typeof text !== 'object' ? { message: text, ...params } : text) });
	};
	upd.object.message.forward = async (peer_id = upd.object.message.peer_id, params = {}) => {
		return this.api.call("messages.send",{ peer_ids: peer_id, random_id: 0, forward: JSON.stringify({ peer_id: upd.object.message.peer_id, conversation_message_ids: upd.object.message.conversation_message_id }), ...(typeof params == "object" ? params : { message: params })  });
	};
	upd.object.message.edit = async (id = upd.object.message.conversation_message_id, params = {}) => {
		return this.api.call("messages.edit",{ peer_id: upd.object.message.peer_id, conversation_message_id: id, random_id: 0, ...(typeof params == "object" ? params : { message: params })  });
	};
	upd.object.message.delete = async (id = upd.object.message.conversation_message_id, params = {}) => {
		return this.api.call("messages.delete",{ peer_ids: upd.object.message.peer_id, conversation_message_ids: id, delete_for_all: true, random_id: 0, ...params  });
	};
	upd.object.message.removeChatUser = async (id, params = {}) => {
		return this.api.call("messages.removeChatUser",{ chat_id: upd.object.message.chat_id, member_id: id, ...(typeof params == "object" ? params : { chat_id: params })  });
	};
	upd.object.message.getConversation = async (id = upd.object.message.peer_id, params = {}) => {
		return this.api.call("messages.getConversationsById",{ peer_ids: id, ...(typeof params == "object" ? params : { chat_id: params })  });
	};


}else if(upd.type == "message_event") {
	upd.object.send = async (text, params = {}) => {
		if(typeof text == 'object' && !text.message && !text.attachment) text = JSON.stringify(text, null, '\t');
		return this.api.call("messages.send",{ peer_ids: upd.object.peer_id, random_id: 0, ...(typeof text !== 'object' ? { message: text, ...params } : text) });
	};
	upd.object.sendMessageEventAnswer = async (text) => {
		if(typeof text == 'object') text = JSON.stringify(text, null, '\t');
		return this.api.call("messages.sendMessageEventAnswer",{ peer_id: upd.object.peer_id, user_id: upd.object.user_id, event_id: upd.object.event_id, event_data: text });
	};
	upd.object.edit = async (m,params = {}) => {
		return this.api.call("messages.edit",{ peer_id: upd.object.peer_id, conversation_message_id: upd.object.conversation_message_id, random_id: 0, ...(typeof m == "object" ? m : { message: m }), ...params  });
	};

}
this.spisok[upd.type](upd.object);
}
}

async function getUpdates(url) {
return (await fetch(url, {
    method: 'GET',
    headers: {},  
    body: null,         
    follow: 1 })).json();
}


const groupMethods = [
	'account',
	'ads',
	'appWidgets',
	'apps',
	'audio',
	'auth',
	'board',
	'database',
	'docs',
	'donut',
	'fave',
	'friends',
	'gifts',
	'groups',
	'leads',
	'leadForms',
	'likes',
	'market',
	'messages',
	'newsfeed',
	'notes',
	'notifications',
	'orders',
	'pages',
	'photos',
	'places',
	'polls',
	'podcasts',
	'prettyCards',
	'search',
	'secure',
	'stats',
	'status',
	'storage',
	'stories',
	'streaming',
	'users',
	'utils',
	'video',
	'wall',
	'widgets'
];
module.exports = lp;
class api {
	constructor(options = {}) {
		Object.defineProperty(this, 'options', {
  			enumerable: false,
  			value: {
				token: null,
				group_id: 0,
				started: false, 
				user_id: 0
			}
		});
for (const group of groupMethods) {
			this[group] = new Proxy(Object.create(null), {

				get: (obj, prop) => (params) => (
					this.call(`${group}.${prop}`, params)
				)
			});
		}
		Object.assign(this.options, options);
		this.stack = [];
		this.n = 0;
		return this;
	};
	async call (method, params = {}) {
		if(this.options.noExec) return this.doMethod(method,params);
		let t = this;
		return new Promise(async (resolve, reject) => {
			params = { group_id: this.options.group_id, random_id: 0, ...params };
			if(this.options.group_id == 0) delete params.group_id;
			this.stack.push(["API."+method + "(" + JSON.stringify(params) + ")", resolve, reject]);
			let n = this.stack.slice();
			if(n.length >= 24) {
				this.stack = [];
				let code = "return [";
				n.map(x => { code += (x[0]) + "," } );
				code = code.substring(0, code.length-1);
				code += "];";
				let u = await this.doExec({ code });
				for (var i = 0; i < n.length; i++) {
					if(u.response[i] === false) {
						return n[i][2](new ApiError(u.execute_errors.shift()));
					}
					n[i][1](u.response[i]);
				};
			}
			setTimeout(async () => {
				if(n.length == this.stack.length) {
					this.stack = [];
					let code = "return [";
					n.map(x => { code += (x[0]) + "," } );
					code = code.substring(0, code.length-1);
					code += "];";
					let u = await this.doExec({ code });
					for (var i = 0; i < n.length; i++) {
						if(u.response[i] === false) {
							return n[i][2](new ApiError(u.execute_errors.shift()));
						}
						n[i][1](u.response[i]);
					};
				}
			}, 10);
		}); 
	};	
	async doMethod (method, params = {}) {
let url = `https://api.vk.com/method/${method}`;
params = { v: "5.124", group_id: this.options.group_id, access_token: this.options.token, random_id: 0, ...params };
if(this.options.group_id == 0) delete params.group_id;
let out = [];

for (let key in params) {
if (params.hasOwnProperty(key)) {
out.push(key + '=' + encodeURIComponent(params[key]));
}
}

out = out.join('&');

let ans = await ((await fetch(url, {
method: 'POST',
headers: { "accept": "*/*", 'content-type': 'application/x-www-form-urlencoded' },
body: out,
timeout: 10000,
follow: 1 }))).json();
if(ans.error) {
let e = new ApiError(ans.error);
throw e;
}
return ans.response;
};
async doExec (params = {}) {
	return new Promise((resolve, rej) => {
let url = `https://api.vk.com/method/execute`;
params = { v: "5.124", group_id: this.options.group_id, access_token: this.options.token, random_id: 0, ...params };
if(this.options.group_id == 0) delete params.group_id;
let out = [];

for (let key in params) {
if (params.hasOwnProperty(key)) {
out.push(key + '=' + encodeURIComponent(params[key]));
}
}

out = out.join('&');


  var options = {

      method: 'POST',
      headers: { "accept": "*/*", 'content-type': 'application/x-www-form-urlencoded' },
      agent: agent
  };
  var req = https.request(url, options, function(res) {
    if (res.statusCode != 200) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      process.exit(1)
    }
    res.setEncoding('utf8');
    let str = '';

  //another chunk of data has been received, so append it to `str`
  res.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been received, so we just print it out here
  res.on('end', function () {
console.log(str);
try {
	ans = JSON.parse(str);
} catch (e) {
console.log(ans.substring(0,150), out)
}
if(ans.error) {
let e = new ApiError(ans.error);
rej(e);
}
resolve(ans);
})
req.write(out);
})
 // console.log(req)
})

}
}

class ApiError {
	constructor(a) {
		this.error = a;
	    this.code = this.error.error_code;
	    this.msg = this.error.error_msg;
		this.params = {};
	    (this.error.request_params || []).map(x=>this.params[x.key]=x.value);
	    delete this.error;
	    return this;
	}
	toString () {
		return "Error "+this.code+" - "+this.msg;
	}
}