app.controller('pressController', ['$scope','$rootScope', function($scope,$rootScope) {
    console.log("In Press Controller");
	$rootScope.headerClass= false;
	$rootScope.headerClassSearchPage = true;
}]);
