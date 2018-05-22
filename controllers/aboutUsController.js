app.controller('aboutUsController', ['$scope','$rootScope', function($scope,$rootScope) {
    console.log("In About us Controller");
	$rootScope.headerClass= false;
	$rootScope.headerClassSearchPage = true;
}]);
