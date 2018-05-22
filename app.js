var app = angular.module('myApp', [
    "ngRoute",
    "ngCookies",
    "ngMask",
    'angular-jwt',
    'ngSanitize',
    'angularValidator',
    'vcRecaptcha',
    'googleplus',
    'angular-loading-bar',
    'toastr',
    'ngMeta',
    'angular-google-analytics'
]);

app.config(function($routeProvider, $locationProvider, ngMetaProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "static/templates/main.html"
        })
        .when("/signout", {
            controller: 'signoutController'
        })
        .when("/search_results/:airport/:start/:end/:startTime/:endTime", {
            templateUrl: "static/templates/search_results.html"
        })
        .when("/faqs", {
            templateUrl: "static/templates/faqs.html"
        })
        .when("/cancel-order", {
            templateUrl: "static/templates/cancel_order.html"
        })
        .when("/contact-us", {
            templateUrl: "static/templates/contact_us.html"
        })
        .when("/signup", {
            controller: 'signupController',
            templateUrl: "static/templates/signup.html"
        })
        .when("/reset-password", {
            controller: 'resetPasswordController',
            templateUrl: "static/templates/reset_password.html"
        })
        .when("/myaccount", {
            controller: 'myaccountController',
            templateUrl: "static/templates/myaccount.html"
        })
        .when("/checkout", {
            controller: 'checkoutController',
            templateUrl: "static/templates/checkout.html"
        })
        .when("/airport/:slug", {
            controller: 'airportController',
            templateUrl: "static/templates/airport.html"
        })
        .when("/airport/:airport_code/:parkinglot_code", {
            controller: 'parkingLotController',
            templateUrl: "static/templates/parking_lot.html"
        })
        .when("/confirmation", {
            controller: 'confirmationController',
            templateUrl: "static/templates/confirmation.html"
        })
        .when("/reservation-receipt", {
            controller: 'reservationReceiptController',
            templateUrl: "static/templates/reservation_receipt.html"
        })
        .when("/invoice", {
            templateUrl: "static/templates/invoice.html"
        })
        .when("/about-us", {
            controller: 'aboutUsController',
            templateUrl: "static/templates/about-us.html"
        })
        .when("/press", {
            controller: 'pressController',
            templateUrl: "static/templates/press.html"
        })
        .when("/careers", {
            controller: 'careersController',
            templateUrl: "static/templates/careers.html"
        })
        .when("/blog", {
            controller: 'blogController',
            templateUrl: "static/templates/blog.html"
        })
        .when("/help-center", {
            controller: 'helpCenterController',
            templateUrl: "static/templates/help-center.html"
        })
        .when("/lot-owners", {
            controller: 'lotOwnersController',
            templateUrl: "static/templates/lot_owners.html"
        })
        .when("/afiliate-programs", {
            controller: 'afiliateProgramsController',
            templateUrl: "static/templates/afiliate_programs.html"
        })
        .otherwise({
            redirectTo: "/"
        })
    $locationProvider.html5Mode(true);
});
app.directive('starRating', function() {
    return {
        restrict: 'EA',
        template: '<div class="rating" ng-class="{readonly: readonly}">'
            +'<i ng-repeat="star in stars" class="icon-smile" ng-class="{voted: star.filled}"></i>'+
            '</div>',
        scope: {
            ratingValue: '=?',
            max: '=?',
            onRatingSelect: '&?',
            readonly: '=?'
        },
        link: function(scope, element, attributes) {
            if (scope.max == undefined) {
                scope.max = 5;
            }

            function updateStars() {
                scope.stars = [];
                for (var i = 0; i < scope.max; i++) {
                    scope.stars.push({
                        filled: i < scope.ratingValue
                    });
                }
            };
            scope.toggle = function(index) {
                if (scope.readonly == undefined || scope.readonly === false) {
                    scope.ratingValue = index + 1;
                    scope.onRatingSelect({
                        rating: index + 1
                    });
                }
            };
            scope.$watch('ratingValue', function(oldValue, newValue) {
                // newValue=oldValue;
                updateStars();
                if (newValue || newValue === 0) {
                    updateStars();
                }
            });
        }
    }
});


app.directive('ssl', function($location, $interpolate) {
    return {
      replace: false,
      restrict: 'AE',
      templateUrl: '<div>{{tag}}</div>',
      controller: function($scope, $element, $attrs) {
        // Add the path to the image asset.
        $scope.logo_url = "https://gotparking.com/static/img/comodo_secure_seal_113x59_transp.png";

        // Interpolate this path into the script tag and then store the script tag to be output to the template.
        //$scope.tag = $interpolate('<script type="text/javascript">TrustLogo("{{ logo_url }}", "CL1", "none");</script>', false, true)({ logo_url: $scope.logo_url });
        $scope.tag   = $interpolate('<script type="text/javascript">TrustLogo("https://gotparking.com/static/img/comodo_secure_seal_113x59_transp.png", "CL1", "none");</script>', false, true);
      },
      link: function(scope, element, attrs) {
         //element.append($interpolate('<script type="text/javascript">TrustLogo("https://gotparking.com/static/img/comodo_secure_seal_113x59_transp.png", "CL1", "none");</script>', false, true));
      }
    };
});

// Initializing Google analytics
app.config(['AnalyticsProvider', function(AnalyticsProvider) {
    // Add configuration code as desired
    AnalyticsProvider.setAccount('UA-100455161-1'); //UU-XXXXXXX-X should be your tracking code
    // Enable e-commerce module (ecommerce.js) 
    AnalyticsProvider.useECommerce(true, false);
}]);

app.config(['$httpProvider', function ($httpProvider) {
    // enable http caching
   $httpProvider.defaults.cache = true;
}])

app.run(['$rootScope', '$http', '$location', function($rootScope, $http, $location) {
    var settings = getSettings();
    settings = $.parseJSON(settings);
    $rootScope.API_URL = settings.api_url;

    $rootScope.rootgclid = "";

    var gclid = $location.search().gclid;

    if(gclid)
    {
        window.localStorage.setItem('gclid',gclid);
        $rootScope.rootgclid = "?gclid="+gclid;
    }
    else
    {
        window.localStorage.removeItem('gclid');
    }
    
}]);

app.config(['GooglePlusProvider', function(GooglePlusProvider) {
    GooglePlusProvider.setScopes('https://www.googleapis.com/auth/userinfo.email');
    GooglePlusProvider.init({
        clientId: '461853961224-69cldi4sau9qb3evv0hiaqh07bjcri65.apps.googleusercontent.com',
        apiKey: 'AIzaSyCCK-Z_wy0cfi1WdT5RKn66ARFG53BAynw'
    });
}]);

app.service('parkingLotService', function() {
    var parkingLotInfo = {};
    var setValue = function(key, value) {
        parkingLotInfo[key] = value;
    };
    var getValue = function() {
        return parkingLotInfo;
    }
    return { setValue: setValue, getValue: getValue };
});
app.directive('getStars', function () {
    return {
        restrict: 'EA',
        scope: {
            rating: '='
        },
        controller: function ($scope) {
            $scope.getRatingsStars = function(rating) {
                var isHalf = rating % 1 > 0.25 && rating % 1 < 0.75 ?1:0, stars = '';
                var isFull = rating % 1 > 0.75? 1: 0;
                rating = parseInt(rating);
                for(var i = 1; i <= rating + isFull; i++) stars += '<i class="icon-star voted"></i>';
                if(isHalf) stars += '<i class="icon-star-half-alt voted"></i>';
                for(var i = 5 - isHalf - isFull; i > rating; i--) stars += '<i class="icon-star-empty voted"></i>'
                return stars;
            }
        },
        template: '<span ng-bind-html="getRatingsStars(rating)"></span>'
    };
});

app.service('airportService', function($http, $rootScope) {
    var airports = [];

    var setValue = function(key, value) {
        airports[key] = value;
    };

    var getAirportDetail = function(slug, callback) {
        $http.get($rootScope.API_URL + "/api/airport/" + slug +"/").then(function(response) {
            console.log("123"+response);
            callback(response)
        }).catch(function(e) {
            callback(e)
        });
    }

    var getTopParkingLots = function(slug, callback) {
        $http.get($rootScope.API_URL + "/api/airport/" + slug + "/parkinglot/?filter=top3").then(function(response) {
            callback(response)
        }).catch(function(e) {
            callback(e)
        });
    }

    var getAirports = function(callback) {
        if (airports.length < 1) {
            $http.post($rootScope.API_URL + "/api/get-airport-list/").then(function(response) {
                airports = response.data.result;
                callback(airports);
            });
        } else {
            callback(airports);
        }
    }
    var getTypeAheadAirports = function() {
        var source = [];
        for (i = 0; i < airports.length; i++) {
            var airport = airports[i];
            var obj = { id: airport.id, name: airport.name + ' (' + airport.code + ')' };
            source.push(obj)
        }
        return source;
    }
    return { setValue: setValue, getAirportDetail: getAirportDetail, getAirports: getAirports, getTopParkingLots: getTopParkingLots, getTypeAheadAirports: getTypeAheadAirports };
});


app.service('MetaService', function($http, ngMeta, $rootScope) {
    var title = 'Gotparking';
    var metaDescription = '';
    var metaKeywords = '';
    return {
        setMeta: function(path) {
            $http.get($rootScope.API_URL + '/api/pagedetail/' + path +'/').then(function(response) {
                // console.log('Meta response',response);
                var pagedetail = response.data.results[0];
                ngMeta.setTitle(pagedetail.meta_title);
                ngMeta.setTag('description', pagedetail.meta_description);
            });

        },
        set: function(newTitle, newMetaDescription, newKeywords) {
            metaKeywords = newKeywords;
            metaDescription = newMetaDescription;
            title = newTitle;
        },
        metaTitle: function() { return title; },
        metaDescription: function() { return metaDescription; },
        metaKeywords: function() { return metaKeywords; }
    }
});


app.service('couponService', function($http, $rootScope) {
    var coupon = {};
    var getCoupon = function(code, callback) {
        $http.get($rootScope.API_URL + "/api/coupon/?code=" + code).then(function(response) {
            callback(response.data.results)
        }).catch(function(e) {
            callback(e)
        });
    };

    return { getCoupon: getCoupon };
});

app.run(['ngMeta', function(ngMeta) {
    ngMeta.init();
}]);