app.controller('headerController', ['$scope', '$rootScope', '$http', '$cookies', '$cookieStore', '$timeout','$location', function($scope, $rootScope, $http, $cookies, $cookieStore, $timeout, $location) {
    console.log('header controller');

    $scope.isActive = function (viewLocation) { 
        return viewLocation === $location.path();
    };

    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        $rootScope.headerClassSearchPage = false;
    });
    $timeout(function(){
        /* ==============================================
            Menu
        =============================================== */
        console.log('Runnint menu script');
        angular.element('a.hide-menu').on("click", function() {

            if($(this).hasClass('hide-submenu'))
            {
                angular.element("ul.show_normal").removeClass("show_normal");
            }

            angular.element('.main-menu').removeClass('show');
            angular.element('.layer').removeClass('layer-is-visible');
        });
        angular.element('a.open_close').on("click", function() {
            angular.element('.main-menu').toggleClass('show');
            angular.element('.layer').toggleClass('layer-is-visible');
            console.log('in this method');
        });
        angular.element('a.show-submenu').on("click", function() {
            angular.element(this).next().toggleClass("show_normal");
        });
        angular.element('a.show-submenu-mega').on("click", function() {
            angular.element(this).next().toggleClass("show_mega");
        });
        if (angular.element(window).width() <= 480) {
            angular.element('a.open_close').on("click", function() {
                angular.element('.cmn-toggle-switch').removeClass('active')
            });
        }
        angular.element(window).bind('resize load', function() {
            if (angular.element(this).width() < 991) {
                angular.element('.collapse#collapseFilters').removeClass('in');
                angular.element('.collapse#collapseFilters').addClass('out');
            } else {
                angular.element('.collapse#collapseFilters').removeClass('out');
                angular.element('.collapse#collapseFilters').addClass('in');
            }
        });
    },100);
    /* ==============================================
        Sticky nav
    =============================================== */
    /*angular.element(window).scroll(function(){
        'use strict';
        if (angular.element(this).scrollTop() > 1){  
            angular.element('header').addClass("sticky");
        }
        else{
            angular.element('header').removeClass("sticky");
        }
     });*/


}]);
app.controller('videoModalController', ['$scope', function($scope) {
    angular.element('.video').magnificPopup({ type: 'iframe' });
}]);
app.controller('parallaxController', ['$scope', function($scope) {
    $('.parallax-window').parallax({ bleed: 10 });
}])
