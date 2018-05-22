app.controller('blogController', ['$scope','$rootScope', function($scope,$rootScope) {
    console.log("In Blog Controller");
	$rootScope.headerClass= false;
	$rootScope.headerClassSearchPage = true;
}]);
