describe('contact.us.ie.legacy', function () {
    var scope, $httpBackend, dispatcher, config;

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('SubmitContactUsMessageFactory', function() {
        var submitter;

        beforeEach(inject(function($http) {
            submitter = SubmitContactUsMessageFactory($http);
        }));

        it('submits message as JSONP', function() {
            $httpBackend.expect('JSONP', 'http://host/context' +
                '?namespace=namespace' +
                '&replyTo=reply-to' +
                '&subject=subject' +
                '&message=message' +
                '&callback=JSON_CALLBACK').respond(0);
            submitter('http://host/context', {
                namespace:'namespace',
                replyTo:'reply-to',
                subject:'subject',
                message:'message'
            });
            $httpBackend.flush();
        });

        it('on submit execute on success handler', function() {
            var invoked = false;
            $httpBackend.when('JSONP', /.*/).respond(201, {ok:true});
            submitter('uri', {}).success(function() {invoked = true;});
            $httpBackend.flush();
            expect(invoked).toEqual(true);
        });

        it('on submit execute on error handler', function() {
            var body, status;
            $httpBackend.when('JSONP', /.*/).respond(201, {
                ok:false,
                violations:'violations'
            });
            submitter('uri', {}).error(function(b, s) {
                body = b;
                status = s;
            });
            $httpBackend.flush();
            expect(status).toEqual(412);
            expect(body).toEqual('violations');
        });

        it('message can be max 1500 chars', function() {
            var body, status;
            var message = '';
            for(var i=0; i<1501; i++)
                message += 'a';

            submitter('uri', {message:message}).error(function(b, s) {
                body = b;
                status = s;
            });

            expect(status).toEqual(412);
            expect(body).toEqual({message:['upperbound.ie']});
        });
    });
});