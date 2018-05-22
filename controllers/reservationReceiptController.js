app.controller('reservationReceiptController', ['$scope','$rootScope', '$http', function($scope,$rootScope,$http) {
    console.log("In reservation Receipt Controller");
	$rootScope.headerClass= false;
    $rootScope.headerClassSearchPage = true;
	$scope.selectedRecType="text-message";

    $scope.reservationReceipt = function(){
        console.log("INSIDE reservation_receipt...");
        console.log($scope.airport_code);
        console.log($scope.last_name);
        console.log($scope.email_address);
        // console.log(JSON.stringify($scope.reservation_receipt.airport_code));

        $http.post($rootScope.API_URL+"/api/reservation_receipt/", {"email": $scope.email_address, "airport_code": $scope.airport_code, "last_name": $scope.last_name}).then(function(response) {
            console.log(response);
            $('#reservation_receipt_msg')[0].innerHTML = response.data.message;
            if(response.data.success === false){
                $('#reservation_receipt_msg').css("color","Red");
            }
            if(response.data.success === true){
                $('#reservation_receipt_msg').css("color", "Green");
            }
        });

    }

}]);


