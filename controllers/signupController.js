app.controller('signupController', ['$scope','$rootScope', '$http','toastr', function($scope,$rootScope,$http,toastr) {
    console.log("In Signup Controller");
	$rootScope.headerClass= true;
	$rootScope.headerClassSearchPage = false;
	angular.element('#login-modal').modal('hide');
	$scope.submit_signup = function(){

		//alert($scope.signup.first_name)

		console.log(JSON.stringify($scope.signup))
		if($scope.signup.password1 !== $scope.signup.password2){
			alert('Password did not matched');
		}else{
			$http.post($rootScope.API_URL+"/api/register/", $scope.signup).then(function(response) {
				console.log(response)
				if(response.data.success === true){
					toastr.success('Success!', 'You have signed up successfully');
				}else{
					toastr.error('Error!', JSON.stringify(response.data.message));
				}
			});
		}

	}
	$scope.comparePswd = function(pass1,pass2){
        if(pass1===pass2){
            return true;
        }
        else{
            return false;
        }
    }
}]);
