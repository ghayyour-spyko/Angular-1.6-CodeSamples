app.controller('cancelController', ['$scope','$rootScope', '$http','toastr','$location', function($scope,$rootScope,$http,toastr,$location) {
    console.log("In cancel Controller");
	$rootScope.headerClass= false;
	$rootScope.headerClassSearchPage = true;

	$scope.cancelOrder = function(){
		console.log('In Cancel Order submit form function');
		$http.post($rootScope.API_URL+"/api/cancel-reservation-airport/"+$scope.reservation_id+'/', {'airport_code':$scope.airport_code, 'email_address': $scope.email_address} ).then(function(response) {
            console.log(response);
            if(response.data.success === true){
                toastr.success('Success! ', 'Reservation Cancelled Successfully');
                $scope.reservation_id='';
                $scope.airport_code='';
                $scope.email_address='';
                $location.path("/myaccount");
            }else{
                toastr.error('Error! ', response.data.message);
            }

        });
	}
}]);
