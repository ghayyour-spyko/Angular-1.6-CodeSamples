app.controller('resetPasswordController', ['$scope','$rootScope', '$http', '$location','toastr', function($scope,$rootScope,$http,$location,toastr) {
    console.log("In Reset Password Controller");
	$rootScope.headerClass= true;
	$rootScope.headerClassSearchPage = false;
	angular.element('#login-modal').modal('hide');

	var token = $location.search().token;

    if(token)
    {
    	$scope.resetPassword = {token:token};
    }
    else
    {
        $location.path("/");
    }

	$scope.submit_reset_password = function(){
		if($scope.resetPassword.newPassword !== $scope.resetPassword.confirmPassword){
			toastr.error('Error!', "Password did not match.");
		}else{
			$http.post($rootScope.API_URL+"/reset_password", $scope.resetPassword).then(function(response) {
				console.log(response)
				if(response.data.success){
					toastr.success('Success!', response.data.success);
				}else{
					toastr.error('Error!', response.data.error);
				}
			});
		}
	}
}]);
