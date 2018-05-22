app.controller('contactController', ['$scope','$rootScope','$http','toastr', function($scope,$rootScope,$http,toastr) {
	console.log("In contact Controller");
	$rootScope.headerClass= false;
    $scope.isContacting = false;

	$scope.contactSubmit = function(){
        $scope.isContacting = true;
        //console.log($scope.contact);

        var form = this.contactform;
                
        $http.post($rootScope.API_URL+"/api/contact/", $scope.contact).then(function(response) {
            //console.log(response);
            if(response.status === 201){
                form.reset();
                form.$setPristine();
                toastr.success('Success!', 'Thankyou for contact us. We will reach you asap.');
            }
            $scope.isContacting = false;
        });
    }
}]);
