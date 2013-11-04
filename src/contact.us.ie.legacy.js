function SubmitContactUsMessageFactory($http) {
    return function(uri, data) {
        var queryString = Object.keys(data).map(function(it) {
            return it + '=' + data[it];
        }).join('&');
        var cache, onSuccess, onError;
        if(data.message && data.message.length > 1500)
            cache = {ok:false, violations:{message:['upperbound.ie']}};
        else
            $http.jsonp(uri + '?' + queryString + '&callback=JSON_CALLBACK').success(function(data) {
                cache = data;
                if(data.ok && onSuccess) onSuccess();
                if(!data.ok && onError) onError(data.violations, 412);
            });
        var wrapper = {
            success:function(cb) {
                onSuccess = cb;
                if(cache && cache.ok) cb();
                return wrapper;
            },
            error:function(cb) {
                onError = cb;
                if(cache && !cache.ok) cb(cache.violations, 412);
            }
        };
        return wrapper;
    }
}