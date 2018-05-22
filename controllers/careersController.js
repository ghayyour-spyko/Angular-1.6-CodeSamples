app.controller('careersController', ['$scope','$rootScope', function($scope,$rootScope) {
    console.log("In Careers Controller");
	$rootScope.headerClass= false;
	$rootScope.headerClassSearchPage = true;
}]);
