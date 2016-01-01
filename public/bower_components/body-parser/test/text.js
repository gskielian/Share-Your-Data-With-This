
var assert = require('assert')
var http = require('http')
var request = require('supertest')

var bodyParser = require('..')

describe('bodyParser.text()', function(){
  var server
  before(function(){
    server = createServer()
  })

  it('should parse text/plain', function(done){
    request(server)
    .post('/')
    .set('Content-Type', 'text/plain')
    .send('user is tobi')
    .expect(200, '"user is tobi"', done)
  })

  it('should 400 when invalid content-length', function(done){
    var server = createServer({ limit: '1kb' })

    var test = request(server).post('/')
    test.set('Content-Type', 'text/plain')
    test.set('Content-Length', '20')
    test.set('Transfer-Encoding', 'chunked')
    test.write('user')
    test.expect(400, /content length/, done)
  })

  it('should handle Content-Length: 0', function(done){
    var server = createServer({ limit: '1kb' })

    request(server)
    .post('/')
    .set('Content-Type', 'text/plain')
    .set('Content-Length', '0')
    .expect(200, '""', done)
  })

  it('should handle empty message-body', function(done){
    var server = createServer({ limit: '1kb' })

    request(server)
    .post('/')
    .set('Content-Type', 'text/plain')
    .set('Transfer-Encoding', 'chunked')
    .send('')
    .expect(200, '""', done)
  })

  it('should handle duplicated middleware', function (done) {
    var textParser = bodyParser.text()
    var server = createServer(function (req, res, next) {
      textParser(req, res, function (err) {
        textParser(req, res, next)
      })
    })

    request(server)
    .post('/')
    .set('Content-Type', 'text/plain')
    .send('user is tobi')
    .expect(200, '"user is tobi"', done)
  })

  describe('with defaultCharser option', function () {
    it('should change default charset', function(done){
      var server = createServer({ defaultCharset: 'koi8-r' })
      var test = request(server).post('/')
      test.set('Content-Type', 'text/plain')
      test.write(new Buffer('6e616d6520697320cec5d4', 'hex'))
      test.expect(200, '"name is нет"', done)
    })

    it('should honor content-type charset', function(done){
      var server = createServer({ defaultCharset: 'koi8-r' })
      var test = request(server).post('/')
      test.set('Content-Type', 'text/plain; charset=utf-8')
      test.write(new Buffer('6e616d6520697320e8aeba', 'hex'))
      test.expect(200, '"name is 论"', done)
    })
  })

  describe('with limit option', function(){
    it('should 413 when over limit with Content-Length', function(done){
      var buf = new Buffer(1028)
      var server = createServer({ limit: '1kb' })

      buf.fill('.')

      request(server)
      .post('/')
      .set('Content-Type', 'text/plain')
      .set('Content-Length', '1028')
      .send(buf.toString())
      .expect(413, done)
    })

    it('should 413 when over limit with chunked encoding', function(done){
      var buf = new Buffer(1028)
      var server = createServer({ limit: '1kb' })

      buf.fill('.')

      var test = request(server).post('/')
      test.set('Content-Type', 'text/plain')
      test.set('Transfer-Encoding', 'chunked')
      test.write(buf.toString())
      test.expect(413, done)
    })

    it('should accept number of bytes', function(done){
      var buf = new Buffer(1028)
      var server = createServer({ limit: 1024 })

      buf.fill('.')

      request(server)
      .post('/')
      .set('Content-Type', 'text/plain')
      .send(buf.toString())
      .expect(413, done)
    })

    it('should not change when options altered', function(done){
      var buf = new Buffer(1028)
      var options = { limit: '1kb' }
      var server = createServer(options)

      buf.fill('.')
      options.limit = '100kb'

      request(server)
      .post('/')
      .set('Content-Type', 'text/plain')
      .send(buf.toString())
      .expect(413, done)
    })

    it('should not hang response', function(done){
      var buf = new Buffer(1024 * 10)
      var server = createServer({ limit: '1kb' })

      buf.fill('.')

      var server = createServer({ limit: '8kb' })
      var test = request(server).post('/')
      test.set('Content-Type', 'text/plain')
      test.write(buf)
      test.write(buf)
      test.write(buf)
      test.expect(413, done)
    })
  })

  describe('with inflate option', function(){
    describe('when false', function(){
      var server;
      before(function(){
        server = createServer({ inflate: false })
      })

      it('should not accept content-encoding', function(done){
        var test = request(server).post('/')
        test.set('Content-Encoding', 'gzip')
        test.set('Content-Type', 'text/plain')
        test.write(new Buffer('1f8b080000000000000bcb4bcc4d55c82c5678b16e170072b3e0200b000000', 'hex'))
        test.expect(415, 'content encoding unsupported', done)
      })
    })

    describe('when true', function(){
      var server;
      before(function(){
        server = createServer({ inflate: true })
      })

      it('should accept content-encoding', function(done){
        var test = request(server).post('/')
        test.set('Content-Encoding', 'gzip')
        test.set('Content-Type', 'text/plain')
      test.write(new Buffer('1f8b080000000000000bcb4bcc4d55c82c5678b16e170072b3e0200b000000', 'hex'))
      test.expect(200, '"name is 论"', done)
      })
    })
  })

  describe('with type option', function(){
    describe('when "text/html"', function () {
      var server
      before(function () {
        server = createServer({ type: 'text/html' })
      })

      it('should parse for custom type', function (done) {
        request(server)
        .post('/')
        .set('Content-Type', 'text/html')
        .send('<b>tobi</b>')
        .expect(200, '"<b>tobi</b>"', done)
      })

      it('should ignore standard type', function (done) {
        request(server)
        .post('/')
        .set('Content-Type', 'text/plain')
        .send('user is tobi')
        .expect(200, '{}', done)
      })
    })

    describe('when a function', function () {
      it('should parse when truthy value returned', function (done) {
        var server = createServer({ type: accept })

        function accept(req) {
          return req.headers['content-type'] === 'text/vnd.something'
        }

        request(server)
        .post('/')
        .set('Content-Type', 'text/vnd.something')
        .send('user is tobi')
        .expect(200, '"user is tobi"', done)
      })

      it('should work without content-type', function (done) {
        var server = createServer({ type: accept })

        function accept(req) {
          return true
        }

        var test = request(server).post('/')
        test.write('user is tobi')
        test.expect(200, '"user is tobi"', done)
      })

      it('should not invoke without a body', function (done) {
        var server = createServer({ type: accept })

        function accept(req) {
          throw new Error('oops!')
        }

        request(server)
        .get('/')
        .expect(200, done)
      })
    })
  })

  describe('with verify option', function(){
    it('should assert value is function', function(){
      var err;

      try {
        var server = createServer({ verify: 'lol' })
      } catch (e) {
        err = e;
      }

      assert.ok(err);
      assert.equal(err.name, 'TypeError');
    })

    it('should error from verify', function(done){
      var server = createServer({verify: function(req, res, buf){
        if (buf[0] === 0x20) throw new Error('no leading space')
      }})

      request(server)
      .post('/')
      .set('Content-Type', 'text/plain')
      .send(' user is tobi')
      .expect(403, 'no leading space', done)
    })

    it('should allow custom codes', function(done){
      var server = createServer({verify: function(req, res, buf){
        if (buf[0] !== 0x20) return
        var err = new Error('no leading space')
        err.status = 400
        throw err
      }})

      request(server)
      .post('/')
      .set('Content-Type', 'text/plain')
      .send(' user is tobi')
      .expect(400, 'no leading space', done)
    })

    it('should allow pass-through', function(done){
      var server = createServer({verify: function(req, res, buf){
        if (buf[0] === 0x20) throw new Error('no leading space')
      }})

      request(server)
      .post('/')
      .set('Content-Type', 'text/plain')
      .send('user is tobi')
      .expect(200, '"user is tobi"', done)
    })

    it('should 415 on unknown charset prior to verify', function (done) {
      var server = createServer({verify: function (req, res, buf) {
        throw new Error('unexpected verify call')
      }})

      var test = request(server).post('/')
      test.set('Content-Type', 'text/plain; charset=x-bogus')
      test.write(new Buffer('00000000', 'hex'))
      test.expect(415, 'unsupported charset "X-BOGUS"', done)
    })
  })

  describe('charset', function(){
    var server;
    before(function(){
      server = createServer()
    })

    it('should parse utf-8', function(done){
      var test = request(server).post('/')
      test.set('Content-Type', 'text/plain; charset=utf-8')
      test.write(new Buffer('6e616d6520697320e8aeba', 'hex'))
      test.expect(200, '"name is 论"', done)
    })

    it('should parse codepage charsets', function(done){
      var test = request(server).post('/')
      test.set('Content-Type', 'text/plain; charset=koi8-r')
      test.write(new Buffer('6e616d6520697320cec5d4', 'hex'))
      test.expect(200, '"name is нет"', done)
    })

    it('should parse when content-length != char length', function(done){
      var test = request(server).post('/')
      test.set('Content-Type', 'text/plain; charset=utf-8')
      test.set('Content-Length', '11')
      test.write(new Buffer('6e616d6520697320e8aeba', 'hex'))
      test.expect(200, '"name is 论"', done)
    })

    it('should default to utf-8', function(done){
      var test = request(server).post('/')
      test.set('Content-Type', 'text/plain')
      test.write(new Buffer('6e616d6520697320e8aeba', 'hex'))
      test.expect(200, '"name is 论"', done)
    })

    it('should 415 on unknown charset', function(done){
      var test = request(server).post('/')
      test.set('Content-Type', 'text/plain; charset=x-bogus')
      test.write(new Buffer('00000000', 'hex'))
      test.expect(415, 'unsupported charset "X-BOGUS"', done)
    })
  })

  describe('encoding', function(){
    var server;
    before(function(){
      server = createServer({ limit: '10kb' })
    })

    it('should parse without encoding', function(done){
      var test = request(server).post('/')
      test.set('Content-Type', 'text/plain')
      test.write(new Buffer('6e616d6520697320e8aeba', 'hex'))
      test.expect(200, '"name is 论"', done)
    })

    it('should support identity encoding', function(done){
      var test = request(server).post('/')
      test.set('Content-Encoding', 'identity')
      test.set('Content-Type', 'text/plain')
      test.write(new Buffer('6e616d6520697320e8aeba', 'hex'))
      test.expect(200, '"name is 论"', done)
    })

    it('should support gzip encoding', function(done){
      var test = request(server).post('/')
      test.set('Content-Encoding', 'gzip')
      test.set('Content-Type', 'text/plain')
      test.write(new Buffer('1f8b080000000000000bcb4bcc4d55c82c5678b16e170072b3e0200b000000', 'hex'))
      test.expect(200, '"name is 论"', done)
    })

    it('should support deflate encoding', function(done){
      var test = request(server).post('/')
      test.set('Content-Encoding', 'deflate')
      test.set('Content-Type', 'text/plain')
      test.write(new Buffer('789ccb4bcc4d55c82c5678b16e17001a6f050e', 'hex'))
      test.expect(200, '"name is 论"', done)
    })

    it('should be case-insensitive', function(done){
      var test = request(server).post('/')
      test.set('Content-Encoding', 'GZIP')
      test.set('Content-Type', 'text/plain')
      test.write(new Buffer('1f8b080000000000000bcb4bcc4d55c82c5678b16e170072b3e0200b000000', 'hex'))
      test.expect(200, '"name is 论"', done)
    })

    it('should fail on unknown encoding', function(done){
      var test = request(server).post('/')
      test.set('Content-Encoding', 'nulls')
      test.set('Content-Type', 'text/plain')
      test.write(new Buffer('000000000000', 'hex'))
      test.expect(415, 'unsupported content encoding "nulls"', done)
    })
  })
})

function createServer(opts){
  var _bodyParser = typeof opts !== 'function'
    ? bodyParser.text(opts)
    : opts

  return http.createServer(function(req, res){
    _bodyParser(req, res, function(err){
      res.statusCode = err ? (err.status || 500) : 200;
      res.end(err ? err.message : JSON.stringify(req.body));
    })
  })
}
