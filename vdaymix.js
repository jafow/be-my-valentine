//vdaymix.js
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ourtunes = require("ourtunes");
ourtunes({});

},{"ourtunes":2}],2:[function(require,module,exports){
var view = require('./lib/view');
var player = require('./lib/player');
var current = require('./lib/current');
var router = require("./lib/router");

module.exports = setup;

function setup (options) {
  current.playerOptions(options);
  view.setup();
  player.setup();
  router.setup();
}

},{"./lib/current":3,"./lib/player":6,"./lib/router":9,"./lib/view":12}],3:[function(require,module,exports){
var attr = require("attr");

module.exports = {
  index: attr(0),
  pause: attr(),
  playing: attr(),
  content: attr(),
  songs: attr(),
  playerOptions: attr({})
};

},{"attr":13}],4:[function(require,module,exports){
var dom = require('domquery');
var current = require('./current');
var render = require("./render");
var playlist = require('./playlist');
var pause = require('./pause');

module.exports = {
  setup: setup
};

function onPauseChange(paused){
  if(paused) {
    dom('.container').removeClass('playing');
    return;
  }

  dom('.container').addClass('playing');
}

function setup(){
  current.pause.subscribe(onPauseChange);
  dom('svg').on('click', pause);
}

},{"./current":3,"./pause":5,"./playlist":7,"./render":8,"domquery":17}],5:[function(require,module,exports){
var current  = require("./current"),
    playlist = require('./playlist');

module.exports = pause;

function pause(){
  if(!current.playing()){
    playlist.songs[current.index()].play();
    return;
  }

  if (current.pause()){
    current.pause(false);
    return;
  }

  current.pause(true);
}

},{"./current":3,"./playlist":7}],6:[function(require,module,exports){
var dom = require('domquery');
var current = require('./current');
var player = require('play-url')(current.playerOptions());
var playlist = require('./playlist');

player.onEnd(playlist.next);

module.exports = {
  setup: setup
};

function onSongChange(start, stop){
  stop && stop.view.removeClass('selected');

  if(start){
    current.pause(false);
    start.view.addClass('selected');
    player.play(start.url());
  }
}

function onPause(pause){
  if(pause){
    player.pause();
    return;
  }

  player.play();
}

function setup(){
  current.playing.subscribe(onSongChange);
  current.pause.subscribe(onPause);
}

},{"./current":3,"./playlist":7,"domquery":17,"play-url":39}],7:[function(require,module,exports){
var dom = require('domquery');
var shuffle = require('shuffle-array');
var current = require('./current');
var render = require("./render");
var newSong = require('./song');
var songs = [];
current.songs(songs);

module.exports = {
  next: next,
  prev: prev,
  songs: songs,
  setup: setup
};

function next(){
  songs[(current.index() + 1) % songs.length].play();
}

function prev(){
  songs.slice(current.index() - 1)[0].play();
}

function setup(){
  current.content({});

  var content = dom('.playlist').html().split('\n');

  dom('.playlist').html(shuffle(content).join('\n'));

  dom('.playlist .song').forEach(function (el, index) {
    var view = dom(el);
    var url = view.attr('data-url');
    var title = view.select('span').html();

    songs.push(newSong({
      title: title,
      url: url,
      view: view,
      index: index
    }));

    current.content()[title] = url;
  });
}

},{"./current":3,"./render":8,"./song":10,"domquery":17,"shuffle-array":88}],8:[function(require,module,exports){
var format    = require('new-format'),
    templates = require('./templates');

module.exports = render;

function render(template, vars){
  return format(templates[template], vars);
}

},{"./templates":11,"new-format":37}],9:[function(require,module,exports){
var page = require("page");
var slug = require("to-slug");
var current = require("./current");

module.exports = {
  setup: setup
};

function setup () {
  page('/', index);
  page('/:song', play);
  page('*', index);
  page();

  current.playing.subscribe(onPlay);
}

function index () {}

function play (ctx, next) {
  var songs = current.songs();
  var playing = current.playing();
  var name = ctx.params.song;

  if (/^.+\.\w+$/.test(name)) return next();

  if(playing && name == playing.slug()) return;

  var i = songs.length;

  while (i--) {
    if (songs[i].slug() != name) continue;
    songs[i].play();
    return;
  }

  page('/');
}

function onPlay (song) {
  page('/' + song.slug());
}

},{"./current":3,"page":38,"to-slug":89}],10:[function(require,module,exports){
var attrs= require('attrs');
var dom = require("domquery");
var slug = require("to-slug");
var current = require('./current');
var render = require('./render');

module.exports = newSong;

function newSong(options){
  var song = attrs({
    title: options.title,
    url: options.url,
    index: options.index,
    slug: slug(options.title)
  });

  song.view = options.view;

  song.play = function(){
    current.playing(song);
    current.index(song.index());
  };

  song.view.select('span').on('click', song.play);

  return song;
}

},{"./current":3,"./render":8,"attrs":16,"domquery":17,"to-slug":89}],11:[function(require,module,exports){
exports["entry.js"] = "var ourtunes = require(\"ourtunes\");\nourtunes({options});\n"
exports["header.html"] = "<div class=\"header\">\n <svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 512 512\" enable-background=\"new 0 0 512 512\" xml:space=\"preserve\">\n <path class=\"play\" d=\"M256,52.481c-113.771,0-206,91.117-206,203.518c0,112.398,92.229,203.52,206,203.52\nc113.772,0,206-91.121,206-203.52C462,143.599,369.772,52.481,256,52.481z M197.604,368.124V148.872l178.799,109.627\nL197.604,368.124z\">\n </path>\n\n <path class=\"pause\" d=\"M256,52.481c-113.771,0-206,91.117-206,203.518c0,112.398,92.229,203.52,206,203.52\nc113.772,0,206-91.121,206-203.52C462,143.599,369.772,52.481,256,52.481z M238.397,356h-58.253V156h58.253V356z M333.854,356\nh-58.252V156h58.252V356z\">\n </path>\n </svg>\n\n</div>\n"
exports["index.html"] = "<!DOCTYPE html>\n<html>\n <head>\n <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n <meta http-equiv=\"content-type\" content=\"text/html; charset=UTF-8\">\n <title>{title}</title>\n <link href=\"{name}.css\" rel=\"stylesheet\" media=\"screen\" />\n <meta property=\"og:title\" content=\"{title}\" />\n <meta property=\"og:type\" content=\"music.playlist\" />\n <meta property=\"og:url\" content=\"{url}\" />\n <meta property=\"og:image\" content=\"{image}\" />\n </head>\n <body>\n <h1 class=\"title\">{title}</h1>\n <div class=\"cover\" style=\"background-image: url({image})\"></div>\n <div class=\"container\">\n {header}\n {playlist}\n </div>\n </body>\n <script type=\"text/javascript\" src=\"{name}.js\"></script>\n</html>\n"
exports["playlist.html"] = "<ul class=\"playlist\">\n {songs}\n</ul>\n"
exports["song.html"] = "<li class=\"song\" data-url=\"{url}\"><span>{title}</span></li>\n"
},{}],12:[function(require,module,exports){
var dom = require("domquery");
var current = require('./current');
var header = require('./header');
var playlist = require('./playlist');
var pause = require('./pause');

module.exports = {
  setup: setup
};

function setup(){
  header.setup();
  playlist.setup();

  var title = document.title;

  current.playing.subscribe(function (song) {
    document.title = song ? song.title() + ' / ' + title : title;
  });

  dom(window)
    .on(':left', playlist.prev)
    .on(':right', playlist.next)
    .on(':space', pause)
    .on(':enter', pause);
}

},{"./current":3,"./header":4,"./pause":5,"./playlist":7,"domquery":17}],13:[function(require,module,exports){
var pubsub = require("new-pubsub"),
    prop   = require("new-prop");

module.exports        = attr;
module.exports.attrs  = attrs;
module.exports.all    = attrs;
module.exports.object = attrs;

function attr(){
  var obj = pubsub(prop.apply(null, arguments).extend(function(raw){

    return function(newValue){
      var oldValue = raw(),
          ret      = raw.apply(undefined, arguments);

      if(arguments.length && oldValue != ret ){
        obj.publish(ret, oldValue);
      }

      return ret;
    };

  }));

  return obj;
}

function attrs(raw, exceptions){
  var obj = {}, key, val;

  for(key in raw){
    val = raw[key];
    obj[key] = ( ! Array.isArray(exceptions) || exceptions.indexOf(key) == -1 )
      && ( typeof val != 'object' || !val || val.constructor != Object )
      && ( typeof val != 'function' )
      ? attr(val)
      : val;
  }

  return obj;
}

},{"new-prop":14,"new-pubsub":15}],14:[function(require,module,exports){
module.exports = prop;

/**
 * Create and return a new property.
 *
 * @param {Anything} rawValue (optional)
 * @param {Function} getter (optional)
 * @param {Function} setter (optional)
 * @return {AdaProperty}
 */
function prop(rawValue, getter, setter){

  var raw = (function(value){

    return function raw(update){
      if( arguments.length ){
        value = update;
      }

      return value;
    };

  }());

  function proxy(update, options){
    if(arguments.length > 0){
      raw( setter ? setter(update, raw()) : update );
    }

    return getter ? getter(raw()) : raw();
  };

  proxy.extend = function(ext){
    raw = ext(raw);
    return proxy;
  }

  proxy.getter = function(newGetter){
    getter = newGetter;
    return proxy;
  };

  proxy.setter = function(newSetter){
    setter = newSetter;
    return proxy;
  };

  proxy.isAdaProperty = true;
  proxy.raw           = raw;

  raw(setter ? setter(rawValue) : rawValue);

  return proxy;
}

},{}],15:[function(require,module,exports){
module.exports = PubSub;

function PubSub(mix){

  var proxy = mix || function pubsubProxy(){
    arguments.length && sub.apply(undefined, arguments);
  };

  function sub(callback){
    subscribe(proxy, callback);
  }

  function subOnce(callback){
    once(proxy, callback);
  }

  function unsubOnce(callback){
    unsubscribeOnce(proxy, callback);
  }

  function unsub(callback){
    unsubscribe(proxy, callback);
  }

  function pub(){
    var args = [proxy];
    Array.prototype.push.apply(args, arguments);
    publish.apply(undefined, args);
  }

  proxy.subscribers        = [];
  proxy.subscribersForOnce = [];

  proxy.subscribe          = sub;
  proxy.subscribe.once     = subOnce;
  proxy.unsubscribe        = unsub;
  proxy.unsubscribe.once   = unsubOnce;
  proxy.publish            = pub;

  return proxy;
}

/**
 * Publish "from" by applying given args
 *
 * @param {Function} from
 * @param {...Any} args
 */
function publish(from){

  var args = Array.prototype.slice.call(arguments, 1);

  if (from && from.subscribers && from.subscribers.length > 0) {
    from.subscribers.forEach(function(cb, i){
      if(!cb) return;

      try {
        cb.apply(undefined, args);
      } catch(exc) {
        setTimeout(function(){ throw exc; }, 0);
      }
    });
  }

  if (from && from.subscribersForOnce && from.subscribersForOnce.length > 0) {
    from.subscribersForOnce.forEach(function(cb, i){
      if(!cb) return;

      try {
        cb.apply(undefined, args);
      } catch(exc) {
        setTimeout(function(){ throw exc; }, 0);
      }
    });

    from.subscribersForOnce = [];

  }

}

/**
 * Subscribe callback to given pubsub object.
 *
 * @param {Pubsub} to
 * @param {Function} callback
 */
function subscribe(to, callback){
  if(!callback) return false;
  return to.subscribers.push(callback);
}


/**
 * Subscribe callback to given pubsub object for only one publish.
 *
 * @param {Pubsub} to
 * @param {Function} callback
 */
function once(to, callback){
  if(!callback) return false;

  return to.subscribersForOnce.push(callback);
}

/**
 * Unsubscribe callback to given pubsub object.
 *
 * @param {Pubsub} to
 * @param {Function} callback
 */
function unsubscribe(to, callback){
  var i = to.subscribers.length;

  while(i--){
    if(to.subscribers[i] && to.subscribers[i] == callback){
      to.subscribers[i] = undefined;

      return i;
    }
  }

  return false;
}


/**
 * Unsubscribe callback subscribed for once to specified pubsub.
 *
 * @param {Pubsub} to
 * @param {Function} callback
 * @return {Boolean or Number}
 */
function unsubscribeOnce(to, callback){
  var i = to.subscribersForOnce.length;

  while(i--){
    if(to.subscribersForOnce[i] && to.subscribersForOnce[i] == callback){
      to.subscribersForOnce[i] = undefined;

      return i;
    }
  }

  return false;
}

},{}],16:[function(require,module,exports){
module.exports = require('attr').attrs;

},{"attr":13}],17:[function(require,module,exports){
var select = require("./lib/select"),
    create = require('./lib/create');

module.exports = select;
module.exports.create = create;

},{"./lib/create":21,"./lib/select":28}],18:[function(require,module,exports){
module.exports = attr;

function attr(chain){

  return function attr(element, name, value){
    if ( arguments.length == 2 ) {
      return element.getAttribute(name);
    }

    element.setAttribute(name, value);

    return chain;
  };

}

},{}],19:[function(require,module,exports){
var unselect = require("./unselect");

module.exports = {
  add          : add,
  addBefore    : addBefore,
  insert       : insert,
  replace      : replace,
  remove       : remove
};

function add(element, child, vars){
  element.appendChild(unselect(child, vars));
}

function addBefore(element, child, varsOrRef, ref){
  element.insertBefore(unselect(child, varsOrRef), pick(element, arguments[ arguments.length - 1 ]));
}

function insert(element, parent){
  add(pick(document, parent), element);
}

function pick(parent, child){
  if ( typeof child == 'string') {
     return parent.querySelector(child);
  }

  return unselect(child);
}

function replace(element, target, replacement){
  element.replaceChild(unselect(replacement), pick(element, target));
}

function remove(element, child){
  if (arguments.length == 1) {
    return element.parentNode.removeChild(element);
  }
  element.removeChild(pick(element, child));
}

},{"./unselect":31}],20:[function(require,module,exports){
module.exports = {
  addClass    : addClass,
  hasClass    : hasClass,
  removeClass : removeClass,
  toggleClass : toggleClass
};

function addClass(element, name){
  element.classList.add(name);
}

function hasClass(element, name){
  return element.classList.contains(name);
}

function removeClass(element, name){
  element.classList.remove(name);
}

function toggleClass(element, name){
  element.classList.toggle(name);
}

},{}],21:[function(require,module,exports){
var select = require("./select");

module.exports = create;

function create(tag){
  return select(document.createElement(tag));
}

},{"./select":28}],22:[function(require,module,exports){
var style = require("./style");

module.exports = {
  hide: hide,
  show: show
};

function hide(element){
  style(element, 'display', 'none');
}

function show(element){
  style(element, 'display', '');
}

},{"./style":29}],23:[function(require,module,exports){
var keyboard = require("./keyboard");

module.exports = {
  change    : event('change'),
  click     : event('click'),
  keydown   : event('keydown'),
  keyup     : event('keyup'),
  keypress  : event('keypress'),
  mousedown : event('mousedown'),
  mouseover : event('mouseover'),
  mouseup   : event('mouseup'),
  resize    : event('resize'),
  on        : on,
  off       : off
};

function event(type){
  return function(element, callback){
    return on(element, type, callback);
  };
}

function off(element, event, callback){
  element.removeEventListener(event, callback, false);
}

function on(element, event, callback){
  if(event.charAt(0) == ':') {
    return keyboard.on(element, event, callback);
  }

  element.addEventListener(event, callback, false);
}

},{"./keyboard":26}],24:[function(require,module,exports){
var format = require('new-format');

module.exports = html;

function html(chain){
  return function(element, newValue, vars){
    if ( arguments.length > 1 ) {
      element.innerHTML = arguments.length > 2 ? format(newValue, vars) : newValue;
      return chain;
    }

    return element.innerHTML;
  };
}

},{"new-format":37}],25:[function(require,module,exports){
module.exports = isHTML;

function isHTML(text){
  return typeof text == 'string' && text.charAt(0) == '<';
}

},{}],26:[function(require,module,exports){
var keynames = require('keynames');

module.exports = {
  on: on
};

function options(key){
  var expected = {}, keys = key.replace(/^\:/g, '').split(':');

  var i = keys.length, name;
  while ( i -- ){
    name = keys[i].trim();

    if(name == 'ctrl') {
      expected.ctrl = true;
      continue;
    }

    if(name == 'alt') {
      expected.alt = true;
      continue;
    }

    if(name == 'shift') {
      expected.shift = true;
      continue;
    }

    expected.key = name.trim();
  }

  return expected;
}

function on(element, keys, callback){
  var expected = options(keys);

  element.addEventListener('keyup', function(event){
    if((event.ctrlKey || undefined) == expected.ctrl &&
       (event.altKey || undefined) == expected.alt &&
       (event.shiftKey || undefined) == expected.shift &&
       keynames[event.keyCode] == expected.key){
      callback(event);
    }
  }, false);
}

},{"keynames":34}],27:[function(require,module,exports){
module.exports = require("domify");

},{"domify":33}],28:[function(require,module,exports){
var newChain  = require("new-chain"),
    format    = require('new-format'),
    attr      = require('./attr'),
    children  = require('./children'),
    classList = require('./classlist'),
    effects   = require('./effects'),
    events    = require('./events'),
    html      = require('./html'),
    isHTML    = require('./is-html'),
    style     = require('./style'),
    text      = require('./text'),
    parse     = require('./parse'),
    val       = require('./val');

module.exports = select;

function each(fn, elements){
  return function(){
    var i, len, ret, params, ret;

    len    = elements.length;
    i      = -1;
    params = [undefined].concat(Array.prototype.slice.call(arguments));

    while ( ++i < len ) {
      params[0] = elements[i];
      ret = fn.apply(undefined, params);
    }

    return ret;
  };
}

function select(query, parent){
  var key, chain, methods, elements;

  if ( isHTML(query) ) {
    elements = [parse(arguments.length > 1 ? format.apply(undefined, arguments) : query)];
  } else if ( typeof query == 'string' ) {
    elements = Array.prototype.slice.call((parent || document).querySelectorAll(query));
  } else if ( query == document ) {
    elements = [document.documentElement];
  } else {
    elements = Array.prototype.slice.call(arguments);
  }

  methods = {
    addClass    : each(classList.addClass, elements),
    removeClass : each(classList.removeClass, elements),
    toggleClass : each(classList.toggleClass, elements),
    show        : each(effects.show, elements),
    hide        : each(effects.hide, elements),
    style       : each(style, elements)
  };

  for ( key in events ) {
    methods[ key ] = each(events[key], elements);
  }

  for ( key in children ) {
    methods[ key ] = each(children[key], elements);
  }

  chain = newChain.from(elements)(methods);

  chain.attr     = each(attr(chain), elements);
  chain.hasClass = each(classList.hasClass, elements),
  chain.html     = each(html(chain), elements);
  chain.text     = each(text(chain), elements);
  chain.val      = each(val(chain), elements);

  chain.select   = function(query){
    return select(query, elements[0]);
  };

  return chain;
}

},{"./attr":18,"./children":19,"./classlist":20,"./effects":22,"./events":23,"./html":24,"./is-html":25,"./parse":27,"./style":29,"./text":30,"./val":32,"new-chain":35,"new-format":37}],29:[function(require,module,exports){
var toCamelCase = require("to-camel-case");

module.exports = style;

function all(element, css){
  var name;
  for ( name in css ) {
    one(element, name, css[name]);
  }
}

function one(element, name, value){
  element.style[toCamelCase(name)] = value;
}

function style(element){
  if ( arguments.length == 3 ) {
    return one(element, arguments[1], arguments[2]);
  }

  return all(element, arguments[1]);
}

},{"to-camel-case":36}],30:[function(require,module,exports){
var format = require('new-format');

module.exports = text;

function text(chain){
  return function(element, newValue, vars){
    if ( arguments.length > 1 ) {
      element.textContent = arguments.length > 2 ? format(newValue, vars) : newValue;
      return chain;
    }

    return element.textContent;
  };
}

},{"new-format":37}],31:[function(require,module,exports){
var format = require('new-format'),
    isHTML = require("./is-html"),
    parse = require('./parse');

module.exports = unselect;

function unselect(el, vars){
  if ( Array.isArray(el) ) return el[0];
  if ( isHTML(el) ) return parse(typeof vars == 'object' ? format(el, vars) : el);
  return el;
}

},{"./is-html":25,"./parse":27,"new-format":37}],32:[function(require,module,exports){
module.exports = val;

function val(chain){
  return function(element, newValue){
    if ( arguments.length > 1 ) {
      element.value = newValue;
      return chain;
    }

    return element.value;
  };
}

},{}],33:[function(require,module,exports){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  var els = el.children;
  if (1 == els.length) {
    return el.removeChild(els[0]);
  }

  var fragment = document.createDocumentFragment();
  while (els.length) {
    fragment.appendChild(el.removeChild(els[0]));
  }

  return fragment;
}

},{}],34:[function(require,module,exports){
module.exports = {
  8   : 'backspace',
  9   : 'tab',
  13  : 'enter',
  16  : 'shift',
  17  : 'ctrl',
  18  : 'alt',
  20  : 'capslock',
  27  : 'esc',
  32  : 'space',
  33  : 'pageup',
  34  : 'pagedown',
  35  : 'end',
  36  : 'home',
  37  : 'left',
  38  : 'up',
  39  : 'right',
  40  : 'down',
  45  : 'ins',
  46  : 'del',
  91  : 'meta',
  93  : 'meta',
  224 : 'meta'
};

},{}],35:[function(require,module,exports){
module.exports = newChain;
module.exports.from = from;

function from(chain){

  return function(){
    var m, i;

    m = methods.apply(undefined, arguments);
    i   = m.length;

    while ( i -- ) {
      chain[ m[i].name ] = m[i].fn;
    }

    m.forEach(function(method){
      chain[ method.name ] = function(){
        method.fn.apply(this, arguments);
        return chain;
      };
    });

    return chain;
  };

}

function methods(){
  var all, el, i, len, result, key;

  all    = Array.prototype.slice.call(arguments);
  result = [];
  i      = all.length;

  while ( i -- ) {
    el = all[i];

    if ( typeof el == 'function' ) {
      result.push({ name: el.name, fn: el });
      continue;
    }

    if ( typeof el != 'object' ) continue;

    for ( key in el ) {
      result.push({ name: key, fn: el[key] });
    }
  }

  return result;
}

function newChain(){
  return from({}).apply(undefined, arguments);
}

},{}],36:[function(require,module,exports){
/**
 * Convert a string to camel case
 *
 * @param {String} str
 * @param {Boolean} first upper-case first too ? (PascalCase)
 */
module.exports = function (str, first) {
  str = str.replace(/[_-]([a-z])/g, function (l) {
  	return l[1].toUpperCase()
  })

  if (first)
    str = str.charAt(0).toUpperCase() + str.slice(1)

  return str
}
},{}],37:[function(require,module,exports){
module.exports = format;

function findContext(args){
  if(typeof args[1] == 'object' && args[1])
    return args[1];

  return Array.prototype.slice.call(args, 1);
}

function format(text) {
  var context = findContext(arguments);

  return String(text).replace(/\{?\{([^{}]+)}}?/g, replace(context));
};

function replace(context, nil){

  return function(tag, name) {

    if(tag.substring(0, 2) == '{{' && tag.substring(tag.length - 2) == '}}'){
      return '{' + name + '}';
    }

    if( !context.hasOwnProperty(name) ){
      return tag;
    }

    if( typeof context[name] == 'function' ){
      return context[name]();
    }

    return context[name];

  }

}

},{}],38:[function(require,module,exports){

;(function(){

  /**
   * Perform initial dispatch.
   */

  var dispatch = true;

  /**
   * Base path.
   */

  var base = '';

  /**
   * Running flag.
   */

  var running;

  /**
   * Register `path` with callback `fn()`,
   * or route `path`, or `page.start()`.
   *
   *   page(fn);
   *   page('*', fn);
   *   page('/user/:id', load, user);
   *   page('/user/' + user.id, { some: 'thing' });
   *   page('/user/' + user.id);
   *   page();
   *
   * @param {String|Function} path
   * @param {Function} fn...
   * @api public
   */

  function page(path, fn) {
    // <callback>
    if ('function' == typeof path) {
      return page('*', path);
    }

    // route <path> to <callback ...>
    if ('function' == typeof fn) {
      var route = new Route(path);
      for (var i = 1; i < arguments.length; ++i) {
        page.callbacks.push(route.middleware(arguments[i]));
      }
    // show <path> with [state]
    } else if ('string' == typeof path) {
      page.show(path, fn);
    // start [options]
    } else {
      page.start(path);
    }
  }

  /**
   * Callback functions.
   */

  page.callbacks = [];

  /**
   * Get or set basepath to `path`.
   *
   * @param {String} path
   * @api public
   */

  page.base = function(path){
    if (0 == arguments.length) return base;
    base = path;
  };

  /**
   * Bind with the given `options`.
   *
   * Options:
   *
   *    - `click` bind to click events [true]
   *    - `popstate` bind to popstate [true]
   *    - `dispatch` perform initial dispatch [true]
   *
   * @param {Object} options
   * @api public
   */

  page.start = function(options){
    options = options || {};
    if (running) return;
    running = true;
    if (false === options.dispatch) dispatch = false;
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
    if (false !== options.click) window.addEventListener('click', onclick, false);
    if (!dispatch) return;
    var url = location.pathname + location.search + location.hash;
    page.replace(url, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function(){
    running = false;
    removeEventListener('click', onclick, false);
    removeEventListener('popstate', onpopstate, false);
  };

  /**
   * Show `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @param {Boolean} dispatch
   * @return {Context}
   * @api public
   */

  page.show = function(path, state, dispatch){
    var ctx = new Context(path, state);
    if (false !== dispatch) page.dispatch(ctx);
    if (!ctx.unhandled) ctx.pushState();
    return ctx;
  };

  /**
   * Replace `path` with optional `state` object.
   *
   * @param {String} path
   * @param {Object} state
   * @return {Context}
   * @api public
   */

  page.replace = function(path, state, init, dispatch){
    var ctx = new Context(path, state);
    ctx.init = init;
    if (null == dispatch) dispatch = true;
    if (dispatch) page.dispatch(ctx);
    ctx.save();
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Object} ctx
   * @api private
   */

  page.dispatch = function(ctx){
    var i = 0;

    function next() {
      var fn = page.callbacks[i++];
      if (!fn) return unhandled(ctx);
      fn(ctx, next);
    }

    next();
  };

  /**
   * Unhandled `ctx`. When it's not the initial
   * popstate then redirect. If you wish to handle
   * 404s on your own use `page('*', callback)`.
   *
   * @param {Context} ctx
   * @api private
   */

  function unhandled(ctx) {
    var current = window.location.pathname + window.location.search;
    if (current == ctx.canonicalPath) return;
    page.stop();
    ctx.unhandled = true;
    window.location = ctx.canonicalPath;
  }

  /**
   * Initialize a new "request" `Context`
   * with the given `path` and optional initial `state`.
   *
   * @param {String} path
   * @param {Object} state
   * @api public
   */

  function Context(path, state) {
    if ('/' == path[0] && 0 != path.indexOf(base)) path = base + path;
    var i = path.indexOf('?');

    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';

    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? path.slice(i + 1) : '';
    this.pathname = ~i ? path.slice(0, i) : path;
    this.params = [];

    // fragment
    this.hash = '';
    if (!~this.path.indexOf('#')) return;
    var parts = this.path.split('#');
    this.path = parts[0];
    this.hash = parts[1] || '';
    this.querystring = this.querystring.split('#')[0];
  }

  /**
   * Expose `Context`.
   */

  page.Context = Context;

  /**
   * Push state.
   *
   * @api private
   */

  Context.prototype.pushState = function(){
    history.pushState(this.state, this.title, this.canonicalPath);
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function(){
    history.replaceState(this.state, this.title, this.canonicalPath);
  };

  /**
   * Initialize `Route` with the given HTTP `path`,
   * and an array of `callbacks` and `options`.
   *
   * Options:
   *
   *   - `sensitive`    enable case-sensitive routes
   *   - `strict`       enable strict matching for trailing slashes
   *
   * @param {String} path
   * @param {Object} options.
   * @api private
   */

  function Route(path, options) {
    options = options || {};
    this.path = path;
    this.method = 'GET';
    this.regexp = pathtoRegexp(path
      , this.keys = []
      , options.sensitive
      , options.strict);
  }

  /**
   * Expose `Route`.
   */

  page.Route = Route;

  /**
   * Return route middleware with
   * the given callback `fn()`.
   *
   * @param {Function} fn
   * @return {Function}
   * @api public
   */

  Route.prototype.middleware = function(fn){
    var self = this;
    return function(ctx, next){
      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
      next();
    };
  };

  /**
   * Check if this route matches `path`, if so
   * populate `params`.
   *
   * @param {String} path
   * @param {Array} params
   * @return {Boolean}
   * @api private
   */

  Route.prototype.match = function(path, params){
    var keys = this.keys
      , qsIndex = path.indexOf('?')
      , pathname = ~qsIndex ? path.slice(0, qsIndex) : path
      , m = this.regexp.exec(pathname);

    if (!m) return false;

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];

      var val = 'string' == typeof m[i]
        ? decodeURIComponent(m[i])
        : m[i];

      if (key) {
        params[key.name] = undefined !== params[key.name]
          ? params[key.name]
          : val;
      } else {
        params.push(val);
      }
    }

    return true;
  };

  /**
   * Normalize the given path string,
   * returning a regular expression.
   *
   * An empty array should be passed,
   * which will contain the placeholder
   * key names. For example "/user/:id" will
   * then contain ["id"].
   *
   * @param  {String|RegExp|Array} path
   * @param  {Array} keys
   * @param  {Boolean} sensitive
   * @param  {Boolean} strict
   * @return {RegExp}
   * @api private
   */

  function pathtoRegexp(path, keys, sensitive, strict) {
    if (path instanceof RegExp) return path;
    if (path instanceof Array) path = '(' + path.join('|') + ')';
    path = path
      .concat(strict ? '' : '/?')
      .replace(/\/\(/g, '(?:/')
      .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
        keys.push({ name: key, optional: !! optional });
        slash = slash || '';
        return ''
          + (optional ? '' : slash)
          + '(?:'
          + (optional ? slash : '')
          + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
          + (optional || '');
      })
      .replace(/([\/.])/g, '\\$1')
      .replace(/\*/g, '(.*)');
    return new RegExp('^' + path + '$', sensitive ? '' : 'i');
  }

  /**
   * Handle "populate" events.
   */

  function onpopstate(e) {
    if (e.state) {
      var path = e.state.path;
      page.replace(path, e.state);
    }
  }

  /**
   * Handle "click" events.
   */

  function onclick(e) {
    if (1 != which(e)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;

    // ensure link
    var el = e.target;
    while (el && 'A' != el.nodeName) el = el.parentNode;
    if (!el || 'A' != el.nodeName) return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (el.pathname == location.pathname && (el.hash || '#' == link)) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(el.href)) return;

    // rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    // same page
    var orig = path + el.hash;

    path = path.replace(base, '');
    if (base && orig == path) return;

    e.preventDefault();
    page.show(orig);
  }

  /**
   * Event button.
   */

  function which(e) {
    e = e || window.event;
    return null == e.which
      ? e.button
      : e.which;
  }

  /**
   * Check if `href` is the same origin.
   */

  function sameOrigin(href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return 0 == href.indexOf(origin);
  }

  /**
   * Expose `page`.
   */

  if ('undefined' == typeof module) {
    window.page = page;
  } else {
    module.exports = page;
  }

})();

},{}],39:[function(require,module,exports){
module.exports = require('./lib/player');

},{"./lib/player":49}],40:[function(require,module,exports){
var attr = require('attr');
var playbackOf = require("./playback-of");
var track = require("./track");
var playing = attr();

module.exports = {
  play: play,
  pause: track.pause,
  onPlay: track.onPlay,
  onEnd: track.onEnd,
  playback: playing
};

function play (url) {
  if (!url && playing()) return track.resume();

  if (!/^\w+\:\/\//.test(url)) {
    url = 'http://' + url;
  }

  var Playback = playbackOf(url);

  if (!Playback) throw new Error('Unable to recognize '+ url + '. Sorry!');

  track.pause();
  track.destroy();

  playing(Playback(url));
  track.source(playing());
}

},{"./playback-of":42,"./track":50,"attr":13}],41:[function(require,module,exports){
module.exports = require('property')();

},{"property":67}],42:[function(require,module,exports){
var playbacks = require('./playbacks');

module.exports = playbackOf;

function playbackOf (url) {
  return playbacks[service(url)];
}

function service (url) {
  if (/soundcloud/.test(url)) return 'soundcloud';
  if (/rdio/.test(url)) return 'rdio';
  if (/youtube/.test(url)) return 'youtube';
  if (/\.mp3$/.test(url)) return 'mp3';
}

},{"./playbacks":44}],43:[function(require,module,exports){
var Struct = require('new-struct');
var pubsub = require("pubsub");

var Playback = Struct({
  url: '',
  sdk: undefined,
  construct: construct,
  destroy: destroy,
  play: play,
  pause: pause,
  resume: resume
});

module.exports = Playback;

function construct (playback) {
  playback.onReady = pubsub();
  playback.onPlay = pubsub();
  playback.onEnd = pubsub();
}

function destroy (playback) {
}

function play (playback) {
  throw new Error('Not Implemented');
}

function pause (playback) {
  throw new Error('Not Implemented');
}

function resume (playback) {
  playback.play();
}

},{"new-struct":57,"pubsub":68}],44:[function(require,module,exports){
module.exports = {
  youtube: require('./youtube'),
  mp3: require('./mp3'),
  soundcloud: require('./soundcloud'),
  rdio: require('./rdio')
};

},{"./mp3":45,"./rdio":46,"./soundcloud":47,"./youtube":48}],45:[function(require,module,exports){
var audio = require("play-audio")();
var pubsub = require('pubsub');
var Playback = require("../playback");
var onPlay = pubsub();
var onEnd = pubsub();

audio.on('play', onPlay.publish).on('ended', onEnd.publish);

var MP3Playback = Playback.extend({
  construct: construct,
  play: play,
  pause: pause
});

module.exports = MP3Playback;

function construct (playback) {
  MP3Playback.supers.construct(playback);
  playback.onPlay = onPlay;
  playback.onEnd = onEnd;
  playback.isReady = true;
  audio.src(playback.url);
}

function destroy () {}

function play (playback) {
  audio.play();
}

function pause (playback) {
  audio.pause();
}

},{"../playback":43,"play-audio":58,"pubsub":68}],46:[function(require,module,exports){
var options = require('../options');
var Playback = require("../playback");
var sdk;

var RdioPlayback = Playback.extend({
  construct: construct,
  play: play,
  pause: pause,
  resume: resume
});

module.exports = RdioPlayback;

function construct (playback) {
  RdioPlayback.supers.construct(playback);

  if (!sdk) {
    options = options().rdio;
    sdk = require("rdio-js-api")(options.key, options.auth);
  }

  playback.onPlay = sdk.onPlay;
  playback.onEnd = sdk.onEnd;

  sdk.ready(function () {
    playback.onReady.publish();
  });
}

function play (playback) {
  sdk.play(playback.url);
}

function pause (playback) {
  sdk.pause();
}

function resume (playback) {
  sdk.play();
}

},{"../options":41,"../playback":43,"rdio-js-api":69}],47:[function(require,module,exports){
var options = require('../options');
var Playback = require("../playback");
var sdk;

var SoundcloudPlayback = Playback.extend({
  construct: construct,
  play: play,
  pause: pause,
  resume: resume
});

module.exports = SoundcloudPlayback;

function construct (playback) {
  SoundcloudPlayback.supers.construct(playback);

  if (!sdk) {
    sdk = require("soundcloud-stream")(options().soundcloud);
  }

  sdk(playback.url, function (error, sound) {
    playback.sound = sound;
    playback.onReady.publish();
  });
}

function destroy () {}

function play (playback) {
  playback.sound.play({
    onplay: playback.onPlay.publish,
    onfinish: playback.onEnd.publish
  });
}

function resume (playback) {
  playback.sound.resume();
}

function pause (playback) {
  playback.sound.pause();
}

},{"../options":41,"../playback":43,"soundcloud-stream":77}],48:[function(require,module,exports){
var hide = require('hide');
var Playback = require("../playback");
var sdk;

var YoutubePlayback = Playback.extend({
  construct: construct,
  play: play,
  pause: pause,
  destroy: destroy
});

module.exports = YoutubePlayback;

function construct (playback) {
  YoutubePlayback.supers.construct(playback);

  if (!sdk) {
    sdk = require('youtube-video');
  }

  var options = {
    onPlay: playback.onPlay.publish,
    onEnd: playback.onEnd.publish
  };

  sdk(playback.url, options, function (error, video) {
    if (error) return this.onError.publish(error);

    hide('#youtube-video');

    playback.sdk = video;
    playback.onReady.publish();
  });
}

function destroy () {
  var el = document.getElementById('youtube-video');
  el.parentNode.removeChild(el);
}

function play (playback) {
  playback.sdk.playVideo();
}

function pause (playback) {
  playback.sdk.pauseVideo();
}

},{"../playback":43,"hide":51,"youtube-video":81}],49:[function(require,module,exports){
var options = require("./options");
var api = require('./api');

module.exports = player;

function player (initialOptions) {
  options(initialOptions);
  return api;
}

},{"./api":40,"./options":41}],50:[function(require,module,exports){
var attr = require("attr");
var pubsub = require('pubsub');

var onPlay = pubsub();
var onEnd = pubsub();
var source = attr();

source.subscribe(function (newSource, oldSource) {
  newSource.onPlay.subscribe.once(onPlay.publish);
  newSource.onEnd.subscribe.once(onEnd.publish);

  if (newSource.isReady) {
    play();
    return;
  }

  newSource.onReady.subscribe.once(play);
});

module.exports = {
  play: play,
  source: source,
  destroy: destroy,
  pause: pause,
  resume: resume,
  onPlay: onPlay,
  onEnd: onEnd
};

function destroy () {
  if (source()) source().destroy();
}


function play () {
  if (source()) source().play();
}

function resume () {
  if (source()) source().resume();
}

function pause () {
  if (source()) source().pause();
}

},{"attr":13,"pubsub":68}],51:[function(require,module,exports){
var select = require("select-dom");
var style = require("style-dom");

var CSS = {
  position: 'absolute',
  top: '-9999px',
  left: '-9999px'
};

module.exports = hide;

function hide (el) {
  if (typeof el == 'string') el = select(el);

  style(el, CSS);
}

},{"select-dom":53,"style-dom":55}],52:[function(require,module,exports){
var qwery = require("qwery");

module.exports = {
  one: one,
  all: all
};

function all (selector, parent) {
  return qwery(selector, parent);
}

function one (selector, parent) {
  return all(selector, parent)[0];
}

},{"qwery":54}],53:[function(require,module,exports){
var fallback = require('./fallback');

module.exports = one;
module.exports.all = all;

function one (selector, parent) {
  parent || (parent = document);

  if (parent.querySelector) {
    return parent.querySelector(selector);
  }

  return fallback.one(selector, parent);
}

function all (selector, parent) {
  parent || (parent = document);

  if (parent.querySelectorAll) {
    return parent.querySelectorAll(selector);
  }

  return fallback.all(selector, parent);
}

},{"./fallback":52}],54:[function(require,module,exports){
/*!
  * @preserve Qwery - A Blazing Fast query selector engine
  * https://github.com/ded/qwery
  * copyright Dustin Diaz 2012
  * MIT License
  */

(function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
})('qwery', this, function () {
  var doc = document
    , html = doc.documentElement
    , byClass = 'getElementsByClassName'
    , byTag = 'getElementsByTagName'
    , qSA = 'querySelectorAll'
    , useNativeQSA = 'useNativeQSA'
    , tagName = 'tagName'
    , nodeType = 'nodeType'
    , select // main select() method, assign later

    , id = /#([\w\-]+)/
    , clas = /\.[\w\-]+/g
    , idOnly = /^#([\w\-]+)$/
    , classOnly = /^\.([\w\-]+)$/
    , tagOnly = /^([\w\-]+)$/
    , tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/
    , splittable = /(^|,)\s*[>~+]/
    , normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g
    , splitters = /[\s\>\+\~]/
    , splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/
    , specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g
    , simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/
    , attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/
    , pseudo = /:([\w\-]+)(\(['"]?([^()]+)['"]?\))?/
    , easy = new RegExp(idOnly.source + '|' + tagOnly.source + '|' + classOnly.source)
    , dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g')
    , tokenizr = new RegExp(splitters.source + splittersMore.source)
    , chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?')

  var walker = {
      ' ': function (node) {
        return node && node !== html && node.parentNode
      }
    , '>': function (node, contestant) {
        return node && node.parentNode == contestant.parentNode && node.parentNode
      }
    , '~': function (node) {
        return node && node.previousSibling
      }
    , '+': function (node, contestant, p1, p2) {
        if (!node) return false
        return (p1 = previous(node)) && (p2 = previous(contestant)) && p1 == p2 && p1
      }
    }

  function cache() {
    this.c = {}
  }
  cache.prototype = {
    g: function (k) {
      return this.c[k] || undefined
    }
  , s: function (k, v, r) {
      v = r ? new RegExp(v) : v
      return (this.c[k] = v)
    }
  }

  var classCache = new cache()
    , cleanCache = new cache()
    , attrCache = new cache()
    , tokenCache = new cache()

  function classRegex(c) {
    return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)', 1)
  }

  // not quite as fast as inline loops in older browsers so don't use liberally
  function each(a, fn) {
    var i = 0, l = a.length
    for (; i < l; i++) fn(a[i])
  }

  function flatten(ar) {
    for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i])
    return r
  }

  function arrayify(ar) {
    var i = 0, l = ar.length, r = []
    for (; i < l; i++) r[i] = ar[i]
    return r
  }

  function previous(n) {
    while (n = n.previousSibling) if (n[nodeType] == 1) break;
    return n
  }

  function q(query) {
    return query.match(chunker)
  }

  // called using `this` as element and arguments from regex group results.
  // given => div.hello[title="world"]:foo('bar')
  // div.hello[title="world"]:foo('bar'), div, .hello, [title="world"], title, =, world, :foo('bar'), foo, ('bar'), bar]
  function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal) {
    var i, m, k, o, classes
    if (this[nodeType] !== 1) return false
    if (tag && tag !== '*' && this[tagName] && this[tagName].toLowerCase() !== tag) return false
    if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) return false
    if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
      for (i = classes.length; i--;) if (!classRegex(classes[i].slice(1)).test(this.className)) return false
    }
    if (pseudo && qwery.pseudos[pseudo] && !qwery.pseudos[pseudo](this, pseudoVal)) return false
    if (wholeAttribute && !value) { // select is just for existance of attrib
      o = this.attributes
      for (k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
          return this
        }
      }
    }
    if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) {
      // select is for attrib equality
      return false
    }
    return this
  }

  function clean(s) {
    return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'))
  }

  function checkAttr(qualify, actual, val) {
    switch (qualify) {
    case '=':
      return actual == val
    case '^=':
      return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^' + clean(val), 1))
    case '$=':
      return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, clean(val) + '$', 1))
    case '*=':
      return actual.match(attrCache.g(val) || attrCache.s(val, clean(val), 1))
    case '~=':
      return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)', 1))
    case '|=':
      return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, '^' + clean(val) + '(-|$)', 1))
    }
    return 0
  }

  // given a selector, first check for simple cases then collect all base candidate matches and filter
  function _qwery(selector, _root) {
    var r = [], ret = [], i, l, m, token, tag, els, intr, item, root = _root
      , tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
      , dividedTokens = selector.match(dividers)

    if (!tokens.length) return r

    token = (tokens = tokens.slice(0)).pop() // copy cached tokens, take the last one
    if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly))) root = byId(_root, m[1])
    if (!root) return r

    intr = q(token)
    // collect base candidates to filter
    els = root !== _root && root[nodeType] !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
      function (r) {
        while (root = root.nextSibling) {
          root[nodeType] == 1 && (intr[1] ? intr[1] == root[tagName].toLowerCase() : 1) && (r[r.length] = root)
        }
        return r
      }([]) :
      root[byTag](intr[1] || '*')
    // filter elements according to the right-most part of the selector
    for (i = 0, l = els.length; i < l; i++) {
      if (item = interpret.apply(els[i], intr)) r[r.length] = item
    }
    if (!tokens.length) return r

    // filter further according to the rest of the selector (the left side)
    each(r, function (e) { if (ancestorMatch(e, tokens, dividedTokens)) ret[ret.length] = e })
    return ret
  }

  // compare element to a selector
  function is(el, selector, root) {
    if (isNode(selector)) return el == selector
    if (arrayLike(selector)) return !!~flatten(selector).indexOf(el) // if selector is an array, is el a member?

    var selectors = selector.split(','), tokens, dividedTokens
    while (selector = selectors.pop()) {
      tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
      dividedTokens = selector.match(dividers)
      tokens = tokens.slice(0) // copy array
      if (interpret.apply(el, q(tokens.pop())) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, root))) {
        return true
      }
    }
    return false
  }

  // given elements matching the right-most part of a selector, filter out any that don't match the rest
  function ancestorMatch(el, tokens, dividedTokens, root) {
    var cand
    // recursively work backwards through the tokens and up the dom, covering all options
    function crawl(e, i, p) {
      while (p = walker[dividedTokens[i]](p, e)) {
        if (isNode(p) && (interpret.apply(p, q(tokens[i])))) {
          if (i) {
            if (cand = crawl(p, i - 1, p)) return cand
          } else return p
        }
      }
    }
    return (cand = crawl(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root))
  }

  function isNode(el, t) {
    return el && typeof el === 'object' && (t = el[nodeType]) && (t == 1 || t == 9)
  }

  function uniq(ar) {
    var a = [], i, j;
    o:
    for (i = 0; i < ar.length; ++i) {
      for (j = 0; j < a.length; ++j) if (a[j] == ar[i]) continue o
      a[a.length] = ar[i]
    }
    return a
  }

  function arrayLike(o) {
    return (typeof o === 'object' && isFinite(o.length))
  }

  function normalizeRoot(root) {
    if (!root) return doc
    if (typeof root == 'string') return qwery(root)[0]
    if (!root[nodeType] && arrayLike(root)) return root[0]
    return root
  }

  function byId(root, id, el) {
    // if doc, query on it, else query the parent doc or if a detached fragment rewrite the query and run on the fragment
    return root[nodeType] === 9 ? root.getElementById(id) :
      root.ownerDocument &&
        (((el = root.ownerDocument.getElementById(id)) && isAncestor(el, root) && el) ||
          (!isAncestor(root, root.ownerDocument) && select('[id="' + id + '"]', root)[0]))
  }

  function qwery(selector, _root) {
    var m, el, root = normalizeRoot(_root)

    // easy, fast cases that we can dispatch with simple DOM calls
    if (!root || !selector) return []
    if (selector === window || isNode(selector)) {
      return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : []
    }
    if (selector && arrayLike(selector)) return flatten(selector)
    if (m = selector.match(easy)) {
      if (m[1]) return (el = byId(root, m[1])) ? [el] : []
      if (m[2]) return arrayify(root[byTag](m[2]))
      if (hasByClass && m[3]) return arrayify(root[byClass](m[3]))
    }

    return select(selector, root)
  }

  // where the root is not document and a relationship selector is first we have to
  // do some awkward adjustments to get it to work, even with qSA
  function collectSelector(root, collector) {
    return function (s) {
      var oid, nid
      if (splittable.test(s)) {
        if (root[nodeType] !== 9) {
          // make sure the el has an id, rewrite the query, set root to doc and run it
          if (!(nid = oid = root.getAttribute('id'))) root.setAttribute('id', nid = '__qwerymeupscotty')
          s = '[id="' + nid + '"]' + s // avoid byId and allow us to match context element
          collector(root.parentNode || root, s, true)
          oid || root.removeAttribute('id')
        }
        return;
      }
      s.length && collector(root, s, false)
    }
  }

  var isAncestor = 'compareDocumentPosition' in html ?
    function (element, container) {
      return (container.compareDocumentPosition(element) & 16) == 16
    } : 'contains' in html ?
    function (element, container) {
      container = container[nodeType] === 9 || container == window ? html : container
      return container !== element && container.contains(element)
    } :
    function (element, container) {
      while (element = element.parentNode) if (element === container) return 1
      return 0
    }
  , getAttr = function () {
      // detect buggy IE src/href getAttribute() call
      var e = doc.createElement('p')
      return ((e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x') ?
        function (e, a) {
          return a === 'class' ? e.className : (a === 'href' || a === 'src') ?
            e.getAttribute(a, 2) : e.getAttribute(a)
        } :
        function (e, a) { return e.getAttribute(a) }
    }()
  , hasByClass = !!doc[byClass]
    // has native qSA support
  , hasQSA = doc.querySelector && doc[qSA]
    // use native qSA
  , selectQSA = function (selector, root) {
      var result = [], ss, e
      try {
        if (root[nodeType] === 9 || !splittable.test(selector)) {
          // most work is done right here, defer to qSA
          return arrayify(root[qSA](selector))
        }
        // special case where we need the services of `collectSelector()`
        each(ss = selector.split(','), collectSelector(root, function (ctx, s) {
          e = ctx[qSA](s)
          if (e.length == 1) result[result.length] = e.item(0)
          else if (e.length) result = result.concat(arrayify(e))
        }))
        return ss.length > 1 && result.length > 1 ? uniq(result) : result
      } catch (ex) { }
      return selectNonNative(selector, root)
    }
    // no native selector support
  , selectNonNative = function (selector, root) {
      var result = [], items, m, i, l, r, ss
      selector = selector.replace(normalizr, '$1')
      if (m = selector.match(tagAndOrClass)) {
        r = classRegex(m[2])
        items = root[byTag](m[1] || '*')
        for (i = 0, l = items.length; i < l; i++) {
          if (r.test(items[i].className)) result[result.length] = items[i]
        }
        return result
      }
      // more complex selector, get `_qwery()` to do the work for us
      each(ss = selector.split(','), collectSelector(root, function (ctx, s, rewrite) {
        r = _qwery(s, ctx)
        for (i = 0, l = r.length; i < l; i++) {
          if (ctx[nodeType] === 9 || rewrite || isAncestor(r[i], root)) result[result.length] = r[i]
        }
      }))
      return ss.length > 1 && result.length > 1 ? uniq(result) : result
    }
  , configure = function (options) {
      // configNativeQSA: use fully-internal selector or native qSA where present
      if (typeof options[useNativeQSA] !== 'undefined')
        select = !options[useNativeQSA] ? selectNonNative : hasQSA ? selectQSA : selectNonNative
    }

  configure({ useNativeQSA: true })

  qwery.configure = configure
  qwery.uniq = uniq
  qwery.is = is
  qwery.pseudos = {}

  return qwery
});

},{}],55:[function(require,module,exports){
var toCamelCase = require("to-camel-case");

module.exports = style;
module.exports.hide = effect('display', 'none');
module.exports.show = effect('display', '');

function all(element, css){
  var name;
  for ( name in css ) {
    one(element, name, css[name]);
  }
}

function effect (name, value) {
  return function (element, override) {
    style(element, name, arguments.length > 1 ? override : value);
  };
}

function one(element, name, value){
  element.style[toCamelCase(name)] = value;
}

function style(element){
  if ( arguments.length == 3 ) {
    return one(element, arguments[1], arguments[2]);
  }

  return all(element, arguments[1]);
}

},{"to-camel-case":56}],56:[function(require,module,exports){
module.exports=require(36)
},{}],57:[function(require,module,exports){
module.exports = newStruct;

function newStruct (content){
  var struct  = Object.create(content),
      props = create.props = [],
      methods = create.methods = [];

  var key;
  for (key in struct) {
    if (typeof struct[key] == 'function') {
      methods.push(key);
    } else {
      props.push(key);
    }
  }

  function create (values){
    var copy = Object.create(struct),
        key, i;

    if (arguments.length == 1 && typeof values == 'object') {
      for (key in values) {
        copy[key] = values[key];
      }
    } else {
      i = arguments.length;
      while (i--) {
        copy[ props[i] ]= arguments[i];
      }
    }

    i = methods.length;
    while (i --) {
      copy[methods[i]] = wrapMethod(copy, struct[methods[i]]);
    }

    if (struct.construct) {
      struct.construct(copy);
    }

    return copy;
  };

  create.extend = function(ext){
    var config = Object.create(content),
        supers = {},
        create;

    var key;
    for (key in ext) {
      if (typeof config[key] == 'function') {
        supers[key] = config[key];
      }

      config[key] = ext[key];
    }

    create = newStruct(config);
    create.supers = supers;

    var ind;
    for (key in ext) {
      if (typeof ext[key] != 'function') {
        create.props.splice(create.props.indexOf(key), 1);
      }
    }

    return create;
  };

  create.method = function (name, fn){
    methods.push(name);
    struct[name] = fn;
    return create;
  };

  return create;
}

function wrapMethod (copy, method){
  return function(){
    var args = Array.prototype.slice.call(arguments);
    args.splice(0, 0, copy);
    return method.apply(undefined, args);
  };
}

},{}],58:[function(require,module,exports){
module.exports = require('media').audio;

},{"media":59}],59:[function(require,module,exports){
module.exports = require('./lib/player');
module.exports.audio = media('audio');
module.exports.video = media('video');

function media (kind) {
  return function (urls, dom) {
    return module.exports(kind, urls, dom);
  };
}

},{"./lib/player":61}],60:[function(require,module,exports){
var table = {
  aif  : "audio/x-aiff",
  aiff : "audio/x-aiff",
  wav  : "audio/x-wav",
  mp3  : 'audio/mpeg',
  m3u  : "audio/x-mpegurl",
  mid  : "audio/midi",
  midi : "audio/midi",
  m4a  : 'audio/m4a',
  ogg  : 'audio/ogg',
  mp4  : 'video/mp4',
  ogv  : 'video/mp4',
  webm : 'video/webm',
  mkv  : 'video/x-matroska',
  mpg  : 'video/mpeg'
};

module.exports = mimeOf;

function mimeOf(url){
  return table[ url.split('.').slice(-1)[0] ];
}

},{}],61:[function(require,module,exports){
var newChain  = require('new-chain'),
    src = require('./src'),
    render = require('./render');

module.exports = play;

function play(media, urls, dom){
  var el, chain, url;

  dom || ( dom = document.documentElement );
  el = render(media);
  dom.appendChild(el);

  chain = newChain({
    autoplay: bool('autoplay'),
    controls: bool('controls'),
    load: method('load'),
    loop: bool('loop'),
    muted: bool('muted'),
    on: on,
    pause: method('pause'),
    play: method('play'),
    preload: bool('preload')
  });

  chain.currentTime = attr('currentTime');
  chain.element = element;
  chain.src = src.attr(el);
  chain.volume = attr('volume');
  chain.remove = remove;

  chain.src(urls);

  return chain;

  function attr(name){
    return function(value){
      if ( arguments.length ) {
        el[name] = value;
        return chain;
      }

      return el[name];
    };
  }

  function bool(name){
    return function(value){
      if (value === false) {
        return el[name] = false;
      }

      return el[name] = true;
    };
  }

  function element(){
    return el;
  }

  function on(event, callback){
    el.addEventListener(event, callback, false);
  }

  function method(name){
    return function(){
      return el[name].apply(el, arguments);
    };
  }

  function remove(){
    return el.parentNode.removeChild(el);
  }

}

},{"./render":62,"./src":63,"new-chain":66}],62:[function(require,module,exports){
var domify = require('domify'),
    templates = require("./templates");

module.exports = render;

function render(media){
  return domify(templates[media + '.html']);
}

},{"./templates":64,"domify":65}],63:[function(require,module,exports){
var mimeOf = require("./mime");

module.exports = {
  attr: attr,
  pick: pick
};

function attr(el){
  var value;

  return function(urls){
    if (arguments.length) {
      value = urls;
      el.setAttribute('src', pick(el, value));
    }

    return value;
  };
}

function pick(el, urls){
  if(!urls) return;

  if(typeof urls == 'string'){
    return urls;
  }

  return urls.filter(function(url){
    return !!el.canPlayType(mimeOf(url));
  })[0];
}

},{"./mime":60}],64:[function(require,module,exports){
exports["audio.html"] = "<audio preload=\"auto\" /></audio>"
exports["video.html"] = "<video preload=\"auto\" /></video>"
},{}],65:[function(require,module,exports){
module.exports=require(33)
},{}],66:[function(require,module,exports){
module.exports=require(35)
},{}],67:[function(require,module,exports){
module.exports=require(14)
},{}],68:[function(require,module,exports){
module.exports = PubSub;

function PubSub(mix){

  var proxy = mix || function pubsubProxy(){
    arguments.length && sub.apply(undefined, arguments);
  };

  function sub(callback){
    subscribe(proxy, callback);
  }

  function subOnce(callback){
    once(proxy, callback);
  }

  function unsubOnce(callback){
    unsubscribeOnce(proxy, callback);
  }

  function unsub(callback){
    unsubscribe(proxy, callback);
  }

  function pub(){
    var args = [proxy];
    Array.prototype.push.apply(args, arguments);
    publish.apply(undefined, args);
  }

  proxy.subscribers        = [];
  proxy.subscribersForOnce = [];

  proxy.subscribe          = sub;
  proxy.subscribe.once     = subOnce;
  proxy.unsubscribe        = unsub;
  proxy.unsubscribe.once   = unsubOnce;
  proxy.publish            = pub;

  return proxy;
}

/**
 * Publish "from" by applying given args
 *
 * @param {Function} from
 * @param {...Any} args
 */
function publish(from){

  var args = Array.prototype.slice.call(arguments, 1);

  if (from && from.subscribers && from.subscribers.length > 0) {
    from.subscribers.forEach(function(cb, i){
      if(!cb) return;

      try {
        cb.apply(undefined, args);
      } catch(exc) {
        setTimeout(function(){ throw exc; }, 0);
      }
    });
  }

  var callbacks;
  if (from && from.subscribersForOnce && from.subscribersForOnce.length > 0) {
    callbacks = from.subscribersForOnce.splice(0, from.subscribersForOnce.length);
    callbacks.forEach(function(cb, i){
      if(!cb) return;

      try {
        cb.apply(undefined, args);
      } catch(exc) {
        setTimeout(function(){ throw exc; }, 0);
      }
    });
    delete callbacks;
  }

}

/**
 * Subscribe callback to given pubsub object.
 *
 * @param {Pubsub} to
 * @param {Function} callback
 */
function subscribe(to, callback){
  if(!callback) return false;
  return to.subscribers.push(callback);
}


/**
 * Subscribe callback to given pubsub object for only one publish.
 *
 * @param {Pubsub} to
 * @param {Function} callback
 */
function once(to, callback){
  if(!callback) return false;

  return to.subscribersForOnce.push(callback);
}

/**
 * Unsubscribe callback to given pubsub object.
 *
 * @param {Pubsub} to
 * @param {Function} callback
 */
function unsubscribe(to, callback){
  var i = to.subscribers.length;

  while(i--){
    if(to.subscribers[i] && to.subscribers[i] == callback){
      to.subscribers[i] = undefined;

      return i;
    }
  }

  return false;
}


/**
 * Unsubscribe callback subscribed for once to specified pubsub.
 *
 * @param {Pubsub} to
 * @param {Function} callback
 * @return {Boolean or Number}
 */
function unsubscribeOnce(to, callback){
  var i = to.subscribersForOnce.length;

  while(i--){
    if(to.subscribersForOnce[i] && to.subscribersForOnce[i] == callback){
      to.subscribersForOnce[i] = undefined;

      return i;
    }
  }

  return false;
}

},{}],69:[function(require,module,exports){
var init = require('./lib/init'),
    api = require("./lib/api");

module.exports = rdio;

function rdio (id, authPath) {
  init(id, authPath);
  return api;
}

},{"./lib/api":70,"./lib/init":72}],70:[function(require,module,exports){
var events = require("./events");
var sdk = require('./init').sdk;
var state = require('./state');

module.exports = {
  onPlay: events.onPlay,
  onPause: events.onPause,
  onEnd: events.onEnd,
  onPlayStateChange: events.onPlayStateChange,
  isPlaying: isPlaying,
  isStopped: isStopped,
  isPaused: isPaused,
  pause: pause,
  play: play,
  playFromKey: playFromKey,
  ready: ready,
  request: request,
  state: state,
  sdk: sdk
};

function isStopped () {
  return state().stopped;
}

function isPaused () {
  return state().paused;
}

function isPlaying () {
  return state().playing;
}

function play (url, callback) {
  var args = arguments;
  ready(function (error, rdio) {
    if (typeof args[0] != 'string') {
      return rdio.player.play();
    }

    request('getObjectFromUrl', { url: url }, function (error, response) {
      playFromKey(response.key, callback);
    });
  });
}

function playFromKey (key, callback) {
  ready(function(error, rdio) {
    rdio.player.play({ source: key  });
    callback && callback();
  });
}

function pause () {
  ready(function (error, rdio) {
    rdio.player.pause();
  });
}

function request (method, options, callback) {
  ready(function (error, rdio) {
    rdio.request({
      method: method,
      content: options,
      success: onSuccess,
      error: onError
    });
  });

  function onSuccess (response) {
    callback(undefined, response.result);
  }

  function onError (response) {
    callback(response);
  }
}

function ready (callback) {
  sdk(function (error, rdio) {
    if (error) throw error;

    rdio.ready(function () {
      if (!ready.called) {
        ready.called = true;
        rdio.player.on('change:playState', events.publishUpdate);
      }

      callback(undefined, rdio);
    });
  });
}

},{"./events":71,"./init":72,"./state":73}],71:[function(require,module,exports){
var pubsub = require("pubsub");
var state = require('./state');
var last;

module.exports = {
  onPlayStateChange: pubsub(),
  onPlay: pubsub(),
  onEnd: pubsub(),
  onPause: pubsub(),
  publishUpdate: publishUpdate
};

function publishUpdate () {
  var now = state();

  setTimeout(function () {
    last = now;
  }, 0);

  if (now.stopped && (last &&  last.playing)) {
    module.exports.onEnd.publish();
  }

  if (now.paused) {
    module.exports.onPause.publish();
  }

  if (now.playing) {
    module.exports.onPlay.publish();
  }
}

},{"./state":73,"pubsub":68}],72:[function(require,module,exports){
var format = require("new-format");
var requireSDK = require("require-sdk");
var sdk;

module.exports = init;
module.exports.sdk = getSDK;

function getSDK () {
  return sdk.apply(undefined, arguments);
}

function init (id, authPath, callback) {
  var url = format('//www.rdio.com/api/api.js?helper={1}&client_id={0}', id, authPath);
  sdk = requireSDK(url, 'R');
  sdk();
}

},{"new-format":37,"require-sdk":74}],73:[function(require,module,exports){
module.exports = state;

function state () {
  var state = R.player.playState();

  return {
    playing: state == R.player.PLAYSTATE_PLAYING,
    paused: state == R.player.PLAYSTATE_PAUSED,
    stopped: state == R.player.PLAYSTATE_STOPPED
  };
}

},{}],74:[function(require,module,exports){
var pubsub = require("pubsub");
var loadScript = require("load-script");

module.exports = requireSDK;

function requireSDK (url, global) {
  var onReady = pubsub();

  var hasManualTrigger;
  var isLoading;
  var isLoaded;

  load.trigger = setManualTrigger;

  return load;

  function isAlreadyLoaded () {
    return window[global];
  }

  function load (callback) {
    if (isAlreadyLoaded() || isLoaded) {
      return callback && callback(undefined, window[global]);
    }

    callback && onReady.subscribe(callback);

    if (isLoading) return;

    isLoading = true;

    if (!url) return;

    loadScript(url, function (error) {
      if (hasManualTrigger) return;

      if (error) {
        isLoaded = true;
        return onReady.publish(error);
      }

      trigger();
    });

  };

  function trigger () {
    isLoaded = true;
    onReady.publish(undefined, global ? window[global] : undefined);
  }

  function setManualTrigger () {
    hasManualTrigger = true;
    return trigger;
  }


}

},{"load-script":75,"pubsub":76}],75:[function(require,module,exports){

module.exports = function load (src, cb) {
  var head = document.head || document.getElementsByTagName('head')[0]
  var script = document.createElement('script')

  script.type = 'text/javascript'
  script.charset = 'utf8'
  script.async = true
  script.src = src

  if (cb) {
    var onend = 'onload' in script ? stdOnEnd : ieOnEnd
    onend(script, cb)
  }

  // some good legacy browsers (firefox) fail the 'in' detection above
  // so as a fallback we always set onload
  // old IE will ignore this and new IE will set onload
  if (!script.onload) {
    stdOnEnd(script, cb);
  }

  head.appendChild(script)
}

function stdOnEnd (script, cb) {
  script.onload = function () {
    this.onerror = this.onload = null
    cb()
  }
  script.onerror = function () {
    // this.onload = null here is necessary
    // because even IE9 works not like others
    this.onerror = this.onload = null
    cb(new Error('Failed to load ' + this.src))
  }
}

function ieOnEnd (script, cb) {
  script.onreadystatechange = function () {
    if (this.readyState != 'complete' && this.readyState != 'loaded') return
    this.onreadystatechange = null
    cb(null, true) // there is no way to catch loading errors in IE8
  }
}

},{}],76:[function(require,module,exports){
module.exports=require(15)
},{}],77:[function(require,module,exports){
var sdk = require("require-sdk")('http://connect.soundcloud.com/sdk.js', 'SC');

module.exports = init;

function stream (url, callback) {
  sdk(function (error, api) {
    resolve(url, function (error, track) {
      if (error) return callback(error);

      api.stream("/tracks/" + track.id, function(sound){
        callback(undefined, sound);
      });
    });
  });
}

function init (id) {
  sdk(function (error, api) {
    api.initialize({
      client_id: id
    });
  });

  return stream;
}

function resolve (url, callback) {
  sdk(function (error, api) {
    api.get('/resolve', { url: url }, function(track) {
      callback(undefined, track);
    });
  });
}

},{"require-sdk":78}],78:[function(require,module,exports){
module.exports=require(74)
},{"load-script":79,"pubsub":80}],79:[function(require,module,exports){
module.exports=require(75)
},{}],80:[function(require,module,exports){
module.exports=require(15)
},{}],81:[function(require,module,exports){
var findall = require("findall");
var newElement = require('new-element');
var sdk = require('require-sdk')('https://www.youtube.com/iframe_api', 'YT');
var loadTrigger = sdk.trigger();

window.onYouTubeIframeAPIReady = function () {
  loadTrigger();
  delete window.onYouTubeIframeAPIReady;
};

module.exports = play;

function play (input, options, callback) {
  var player;
  var api;

  if (arguments.length == 2 && typeof options == 'function') {
    callback = options;
    options = {};
  }

  var elementId = options.selector ? options.elementId : defaultElementId();

  sdk(function (error, youtube) {
    api = youtube;

    player = new api.Player(
      elementId,
      {
        height: options.height,
        width: options.width,
        playerVars: {
          autoplay: options.autoplay ? 1 : 0,
          controls: options.controls ? 1 : 0,
          loop: options.loop ? 1 : 0
        },
        videoId: pickID(input),
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
  });

  function onPlayerReady (event) {
    callback && callback(undefined, event.target);
  }

  function onPlayerStateChange (event) {
    if (event.data == api.PlayerState.PLAYING && options.onPlay) {
      options.onPlay(event.target);
    }

    if (event.data == api.PlayerState.ENDED && options.onEnd) {
      options.onEnd(event.target);
    }

    if (event.data == api.PlayerState.PAUSED && options.onPause) {
      options.onPause(event.target);
    }
  }

}

function pickID (input) {
  if (!/\./.test(input)) return input;

  var match = findall(input, /(?:\?|&)v=([^&]+)/);

  if (match) return match[0];
}

function defaultElementId () {
  var id = 'youtube-video';
  var defaultEl = document.getElementById(id);

  if (defaultEl) {
    defaultEl.parentNode.removeChild(defaultEl);
  }

  defaultEl = newElement('<div id="{id}"></div>', { id: id });
  document.documentElement.appendChild(defaultEl);
  return id;
}

},{"findall":82,"new-element":83,"require-sdk":85}],82:[function(require,module,exports){
module.exports = findall;

function  findall (text, re) {
  var match, matched, result = [];

  if (!re.global) {

    if(match = text.match(re)) {
      match.length > 1 && result.push(match[1]);
      matched = true;
    }

  } else {

    while (match = re.exec(text)) {
      matched = true;
      result.push.apply(result, match.slice(1));
    };

  }

  return !matched || result.length == 0 ? undefined : result;
}

},{}],83:[function(require,module,exports){
var domify = require("domify");
var format = require("new-format");

module.exports = newElement;

function newElement (html, vars) {
  if (!vars) return domify(html);

  return domify(format(html, vars));
}

},{"domify":84,"new-format":37}],84:[function(require,module,exports){
module.exports=require(33)
},{}],85:[function(require,module,exports){
module.exports=require(74)
},{"load-script":86,"pubsub":87}],86:[function(require,module,exports){
module.exports=require(75)
},{}],87:[function(require,module,exports){
module.exports=require(15)
},{}],88:[function(require,module,exports){
/**
 * Randomize the order of the elements in a given array.
 * @param {array} arr - The given array.
 * @param {boolean} [copy] - Sets if should return a shuffled copy of the given array. By default it's a falsy value.
 * @returns {array}
 */
module = module.exports = function (arr, copy) {

    if (!Array.isArray(arr)) {
        throw new Error('shuffle-array expect an array as parameter.');
    }

    var collection = arr,
        len = arr.length,
        random,
        temp;

    if (copy === true) {
        collection = arr.slice();
    }

    while (len) {
        random = Math.floor(Math.random() * len);
        len -= 1;
        temp = collection[len];
        collection[len] = collection[random];
        collection[random] = temp;
    }

    return collection;
};

/**
 * Pick one or more random elements from the given array.
 * @param {array} arr - The given array.
 * @param {number} picks [optional] - Specifies how many random elements you want to pick. By default it picks 1.
 * @returns {Object}
 */
module.pick = function (arr, picks) {

    if (!Array.isArray(arr)) {
        throw new Error('shuffle-array.pick() expect an array as parameter.');
    }

    if (typeof picks === 'number' && picks !== 1) {
        var len = arr.length,
            collection = arr.slice(),
            random = [],
            index;

        while (picks) {
            index = Math.floor(Math.random() * len);
            random.push(collection[index]);
            collection.splice(index, 1);
            len -= 1;
            picks -= 1;
        }

        return random;
    }

    return arr[Math.floor(Math.random() * arr.length)];
};
},{}],89:[function(require,module,exports){
var toSlugCase = require("to-slug-case");
var anglicize = require("anglicize");

module.exports = slug;

function slug (input) {
  return toSlugCase(anglicize(input));
}

},{"anglicize":90,"to-slug-case":95}],90:[function(require,module,exports){
var anglicize = require("./lib/anglicize");

module.exports = anglicize;

},{"./lib/anglicize":91}],91:[function(require,module,exports){
var charactersRE = require("./re"),
    dict         = require('./dict');

module.exports = anglicize;

function anglicize(input){

  return input.replace(charactersRE, function(character){
    return dict[character] || character;
  });

}

},{"./dict":93,"./re":94}],92:[function(require,module,exports){
var dict = require("./dict");

module.exports = Object.keys(dict);

},{"./dict":93}],93:[function(require,module,exports){
module.exports = {
  // latin
  'Ã€': 'A', 'Ã': 'A', 'Ã‚': 'A', 'Ãƒ': 'A', 'Ã„': 'A', 'Ã…': 'A', 'Ã†': 'AE',
  'Ã‡': 'C', 'Ãˆ': 'E', 'Ã‰': 'E', 'ÃŠ': 'E', 'Ã‹': 'E', 'ÃŒ': 'I', 'Ã': 'I',
  'ÃŽ': 'I', 'Ã': 'I', 'Ã': 'D', 'Ã‘': 'N', 'Ã’': 'O', 'Ã“': 'O', 'Ã”': 'O',
  'Ã•': 'O', 'Ã–': 'O', 'Å': 'O', 'Ã˜': 'O', 'Ã™': 'U', 'Ãš': 'U', 'Ã›': 'U',
  'Ãœ': 'U', 'Å°': 'U', 'Ã': 'Y', 'Ãž': 'TH', 'ÃŸ': 'ss', 'Ã ':'a', 'Ã¡':'a',
  'Ã¢': 'a', 'Ã£': 'a', 'Ã¤': 'a', 'Ã¥': 'a', 'Ã¦': 'ae', 'Ã§': 'c', 'Ã¨': 'e',
  'Ã©': 'e', 'Ãª': 'e', 'Ã«': 'e', 'Ã¬': 'i', 'Ã­': 'i', 'Ã®': 'i', 'Ã¯': 'i',
  'Ã°': 'd', 'Ã±': 'n', 'Ã²': 'o', 'Ã³': 'o', 'Ã´': 'o', 'Ãµ': 'o', 'Ã¶': 'o',
  'Å‘': 'o', 'Ã¸': 'o', 'Ã¹': 'u', 'Ãº': 'u', 'Ã»': 'u', 'Ã¼': 'u', 'Å±': 'u',
  'Ã½': 'y', 'Ã¾': 'th', 'Ã¿': 'y', 'áºž': 'SS',

  // greek
  'Î±':'a', 'Î²':'b', 'Î³':'g', 'Î´':'d', 'Îµ':'e', 'Î¶':'z', 'Î·':'h', 'Î¸':'8',
  'Î¹':'i', 'Îº':'k', 'Î»':'l', 'Î¼':'m', 'Î½':'n', 'Î¾':'3', 'Î¿':'o', 'Ï€':'p',
  'Ï':'r', 'Ïƒ':'s', 'Ï„':'t', 'Ï…':'y', 'Ï†':'f', 'Ï‡':'x', 'Ïˆ':'ps', 'Ï‰':'w',
  'Î¬':'a', 'Î­':'e', 'Î¯':'i', 'ÏŒ':'o', 'Ï':'y', 'Î®':'h', 'ÏŽ':'w', 'Ï‚':'s',
  'ÏŠ':'i', 'Î°':'y', 'Ï‹':'y', 'Î':'i',
  'Î‘':'A', 'Î’':'B', 'Î“':'G', 'Î”':'D', 'Î•':'E', 'Î–':'Z', 'Î—':'H', 'Î˜':'8',
  'Î™':'I', 'Îš':'K', 'Î›':'L', 'Îœ':'M', 'Î':'N', 'Îž':'3', 'ÎŸ':'O', 'Î ':'P',
  'Î¡':'R', 'Î£':'S', 'Î¤':'T', 'Î¥':'Y', 'Î¦':'F', 'Î§':'X', 'Î¨':'PS', 'Î©':'W',
  'Î†':'A', 'Îˆ':'E', 'ÎŠ':'I', 'ÎŒ':'O', 'ÎŽ':'Y', 'Î‰':'H', 'Î':'W', 'Îª':'I',
  'Î«':'Y',

  // turkish
  'ÅŸ':'s', 'Åž':'S', 'Ä±':'i', 'Ä°':'I', 'Ã§':'c', 'Ã‡':'C', 'Ã¼':'u', 'Ãœ':'U',
  'Ã¶':'o', 'Ã–':'O', 'ÄŸ':'g', 'Äž':'G',

  // russian
  'Ð°':'a', 'Ð±':'b', 'Ð²':'v', 'Ð³':'g', 'Ð´':'d', 'Ðµ':'e', 'Ñ‘':'yo', 'Ð¶':'zh',
  'Ð·':'z', 'Ð¸':'i', 'Ð¹':'j', 'Ðº':'k', 'Ð»':'l', 'Ð¼':'m', 'Ð½':'n', 'Ð¾':'o',
  'Ð¿':'p', 'Ñ€':'r', 'Ñ':'s', 'Ñ‚':'t', 'Ñƒ':'u', 'Ñ„':'f', 'Ñ…':'h', 'Ñ†':'c',
  'Ñ‡':'ch', 'Ñˆ':'sh', 'Ñ‰':'sh', 'ÑŠ':'u', 'Ñ‹':'y', 'ÑŒ':'', 'Ñ':'e', 'ÑŽ':'yu',
  'Ñ':'ya',
  'Ð':'A', 'Ð‘':'B', 'Ð’':'V', 'Ð“':'G', 'Ð”':'D', 'Ð•':'E', 'Ð':'Yo', 'Ð–':'Zh',
  'Ð—':'Z', 'Ð˜':'I', 'Ð™':'J', 'Ðš':'K', 'Ð›':'L', 'Ðœ':'M', 'Ð':'N', 'Ðž':'O',
  'ÐŸ':'P', 'Ð ':'R', 'Ð¡':'S', 'Ð¢':'T', 'Ð£':'U', 'Ð¤':'F', 'Ð¥':'H', 'Ð¦':'C',
  'Ð§':'Ch', 'Ð¨':'Sh', 'Ð©':'Sh', 'Ðª':'U', 'Ð«':'Y', 'Ð¬':'', 'Ð­':'E', 'Ð®':'Yu',
  'Ð¯':'Ya',

  // ukranian
  'Ð„':'Ye', 'Ð†':'I', 'Ð‡':'Yi', 'Ò':'G', 'Ñ”':'ye', 'Ñ–':'i', 'Ñ—':'yi', 'Ò‘':'g',

  // czech
  'Ä':'c', 'Ä':'d', 'Ä›':'e', 'Åˆ': 'n', 'Å™':'r', 'Å¡':'s', 'Å¥':'t', 'Å¯':'u',
  'Å¾':'z', 'ÄŒ':'C', 'ÄŽ':'D', 'Äš':'E', 'Å‡': 'N', 'Å˜':'R', 'Å ':'S', 'Å¤':'T',
  'Å®':'U', 'Å½':'Z',

  // polish
  'Ä…':'a', 'Ä‡':'c', 'Ä™':'e', 'Å‚':'l', 'Å„':'n', 'Ã³':'o', 'Å›':'s', 'Åº':'z',
  'Å¼':'z', 'Ä„':'A', 'Ä†':'C', 'Ä˜':'e', 'Å':'L', 'Åƒ':'N', 'Åš':'S',
  'Å¹':'Z', 'Å»':'Z',

  // latvian
  'Ä':'a', 'Ä':'c', 'Ä“':'e', 'Ä£':'g', 'Ä«':'i', 'Ä·':'k', 'Ä¼':'l', 'Å†':'n',
  'Å¡':'s', 'Å«':'u', 'Å¾':'z', 'Ä€':'A', 'ÄŒ':'C', 'Ä’':'E', 'Ä¢':'G', 'Äª':'i',
  'Ä¶':'k', 'Ä»':'L', 'Å…':'N', 'Å ':'S', 'Åª':'u', 'Å½':'Z'
};

},{}],94:[function(require,module,exports){
var characters = require("./characters");

module.exports = new RegExp('[' + characters.join('') + ']', 'g');

},{"./characters":92}],95:[function(require,module,exports){

var toSpace = require('to-space-case');


/**
 * Expose `toSlugCase`.
 */

module.exports = toSlugCase;


/**
 * Convert a `string` to slug case.
 *
 * @param {String} string
 * @return {String}
 */


function toSlugCase (string) {
  return toSpace(string).replace(/\s/g, '-');
}
},{"to-space-case":96}],96:[function(require,module,exports){

var clean = require('to-no-case');


/**
 * Expose `toSpaceCase`.
 */

module.exports = toSpaceCase;


/**
 * Convert a `string` to space case.
 *
 * @param {String} string
 * @return {String}
 */


function toSpaceCase (string) {
  return clean(string).replace(/[\W_]+(.|$)/g, function (matches, match) {
    return match ? ' ' + match : '';
  });
}
},{"to-no-case":97}],97:[function(require,module,exports){

/**
 * Expose `toNoCase`.
 */

module.exports = toNoCase;


/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/;
var hasCamel = /[a-z][A-Z]/;
var hasSeparator = /[\W_]/;


/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */

function toNoCase (string) {
  if (hasSpace.test(string)) return string.toLowerCase();

  if (hasSeparator.test(string)) string = unseparate(string);
  if (hasCamel.test(string)) string = uncamelize(string);
  return string.toLowerCase();
}


/**
 * Separator splitter.
 */

var separatorSplitter = /[\W_]+(.|$)/g;


/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function unseparate (string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? ' ' + next : '';
  });
}


/**
 * Camelcase splitter.
 */

var camelSplitter = /(.)([A-Z]+)/g;


/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function uncamelize (string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');
  });
}
},{}]},{},[1])