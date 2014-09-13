/*global describe, it, before, after */
/*jshint expr:true*/
var supertest     = require('supertest'),
    express       = require('express'),
    should        = require('should'),
    testUtils     = require('../../../utils'),
    user          = testUtils.DataGenerator.forModel.users[0],
    ghost         = require('../../../../../core'),
    httpServer,
    request;


describe('Authentication API', function () {
    var accesstoken = '';

    before(function (done) {
        var app = express();

        // starting ghost automatically populates the db
        // TODO: prevent db init, and manage bringing up the DB with fixtures ourselves
        ghost({app: app}).then(function (_httpServer) {
            httpServer = _httpServer;
            request = supertest.agent(app);
        }).then(function () {
            return testUtils.doAuth(request);
        }).then(function (token) {
            accesstoken = token;
            done();
        }).catch(function (e) {
            console.log('Ghost Error: ', e);
            console.log(e.stack);
        });
    });

    after(function (done) {
        testUtils.clearData().then(function () {
            httpServer.close();
            done();
        });
    });

    it('can authenticate', function (done) {
        request.post(testUtils.API.getApiQuery('authentication/token'))
            .send({ grant_type: 'password', username: user.email, password: user.password, client_id: 'ghost-admin'})
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                should.not.exist(res.headers['x-cache-invalidate']);
                var jsonResponse = res.body;
                should.exist(jsonResponse.access_token);
                should.exist(jsonResponse.refresh_token);
                should.exist(jsonResponse.expires_in);
                should.exist(jsonResponse.token_type);
                done();
            });
    });

    it('can\'t authenticate unknown user', function (done) {
        request.post(testUtils.API.getApiQuery('authentication/token'))
            .send({ grant_type: 'password', username: 'invalid@email.com', password: user.password, client_id: 'ghost-admin'})
            .expect('Content-Type', /json/)
            .expect(404)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var jsonResponse = res.body;
                should.exist(jsonResponse.errors[0].type);
                jsonResponse.errors[0].type.should.eql('NotFoundError');
                done();
            });
    });

    it('can\'t authenticate invalid password user', function (done) {
        request.post(testUtils.API.getApiQuery('authentication/token'))
            .send({ grant_type: 'password', username: user.email, password: 'invalid', client_id: 'ghost-admin'})
            .expect('Content-Type', /json/)
            .expect(401)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var jsonResponse = res.body;
                should.exist(jsonResponse.errors[0].type);
                jsonResponse.errors[0].type.should.eql('UnauthorizedError');
                done();
            });
    });

    it('can request new access token', function (done) {
        request.post(testUtils.API.getApiQuery('authentication/token'))
            .send({ grant_type: 'password', username: user.email, password: user.password, client_id: 'ghost-admin'})
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var refreshToken = res.body.refresh_token;
                request.post(testUtils.API.getApiQuery('authentication/token'))
                    .send({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: 'ghost-admin'})
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        var jsonResponse = res.body;
                        should.exist(jsonResponse.access_token);
                        should.exist(jsonResponse.expires_in);
                        done();
                    });
            });
    });

    it('can\'t request new access token with invalid refresh token', function (done) {
        request.post(testUtils.API.getApiQuery('authentication/token'))
            .send({ grant_type: 'refresh_token', refresh_token: 'invalid', client_id: 'ghost-admin'})
            .expect('Content-Type', /json/)
            .expect(403)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var jsonResponse = res.body;
                should.exist(jsonResponse.errors[0].type);
                jsonResponse.errors[0].type.should.eql('NoPermissionError');
                done();
            });
    });
});
