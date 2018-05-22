app.controller('modalController', ['$scope', '$rootScope', '$http', '$cookies', '$cookieStore', '$timeout', 'jwtHelper','toastr', function($scope, $rootScope, $http, $cookies, $cookieStore, $timeout, jwtHelper,toastr) {
    console.log('modal controller');

    $scope.showLoginError=false;
    $scope.showResetError = false;
    $scope.showResetSuccess = false;
    $scope.signin_user = function() {
        $http.post($rootScope.API_URL+"/api/login/", { 'username': $scope.username, 'password': $scope.password }).then(function(response) {
            console.log("in response of login user@#@#@#");
            console.log(response.data);
            var token = response.data.token;
            if (typeof(token) != 'undefined') {
                var userid = jwtHelper.decodeToken(token).user_id;
                console.log('logged in user : ' + userid );
                $rootScope.gp_userId = userid;
                $rootScope.gp_loggedIn = true;
                $rootScope.gp_userToken = token
                $cookieStore.put('gp_loggedIn', $rootScope.gp_loggedIn);   
                $cookieStore.put('gp_userId', $rootScope.gp_userId);
                $cookieStore.put('gp_userToken', $rootScope.gp_userToken);
                $http.defaults.headers.common['Authorization'] = 'JWT ' + $rootScope.gp_userToken;

                window.location.href = '/';
            } else {
                alert(response.data.message);
            }
        },function(response) {
            $scope.showLoginError=true;
        });

    };

    $scope.forgotPswSubmit = function() {
        $http.post($rootScope.API_URL+"/forget_password", $scope.forgot).then(function(response) {
            if(response.data.success)
            {
                toastr.success('Success!', response.data.success);
            }
            else
            {
                toastr.error('Error!', response.data.error);
            }
        },function(response) {
            toastr.error('Error!', "There was an error while processing the request.");
        });

    };

    $scope.addReview = function(){
        alert('called');
        console.log(JSON.stringify($scope.review));
          $http.post($rootScope.API_URL+"/api/review/", $scope.review).then(function(response) {
            console.log(response)
          });  
    };
    

}]);
