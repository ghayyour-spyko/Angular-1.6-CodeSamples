app.controller('footerController', ['$scope','$rootScope', '$http',  function($scope,$rootScope, $http) {
    console.log("In footer Controller!");
   
   	$scope.top_airports = [];
   	$http.get($rootScope.API_URL+"/api/airport/?filter=top").then(function(response) {
        console.log(response.data.results);
        $scope.top_airports = response.data.results;
    });
    /* terms */
    $scope.footerTerms='';
    $http.get($rootScope.API_URL+'/api/gp-settings/terms/').then(function(response){
            try{
                $scope.footerTerms = response.data.result.value;                
            }catch(err){
                
            }
        });

    /* terms */

}]);
