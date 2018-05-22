app.controller('helpCenterController', ['$scope','$rootScope', function($scope,$rootScope) {
    console.log("In help center Controller");
	$rootScope.headerClass= false;
	$rootScope.headerClassSearchPage = true;
}]);
