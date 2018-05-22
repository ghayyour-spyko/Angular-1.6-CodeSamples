app.controller('confirmationController', ['$scope','$rootScope', '$http', '$timeout','$location', '$cookieStore', 'parkingLotService', function($scope,$rootScope,$http, $timeout,$location,$cookieStore,parkingLotService) {
    console.log("In confirmation Controller");
	$rootScope.headerClass= true;

    $scope.parkingLotService = parkingLotService.getValue();

    try {
        if (typeof($scope.parkingLotService.parkingLot['id']) == "undefined") {
            $location.path("/");
        }
    } catch (err) {
        $location.path("/");
    }

    $scope.parkingLot = $scope.parkingLotService.parkingLot;

    $scope.parkingLot.reservation_details = $scope.parkingLot.reservation_details ? String($scope.parkingLot.reservation_details).replace(/<[^>]+>/gm, '') : '';

    //console.log($scope.parkingLot.reservation_details);

    //console.log($scope.parkingLot);

    $scope.transaction = $scope.parkingLotService.transaction;
    $scope.user = $rootScope.gp_userId; //{full_name:'AB'}; //$cookieStore.get('gp_user');

    $scope.today = moment().format('MMM DD, YYYY');

    $scope.reservationId = $scope.parkingLotService.reservation['id'];
    $scope.start = $scope.parkingLotService['start'];
    $scope.end = $scope.parkingLotService['end'];
    $scope.start_day = $scope.start.split(',')[0];
    $scope.end_day = $scope.end.split(',')[0];
    $scope.checkInTime = moment($scope.parkingLotService['checkInTime']).format("MMM D, YYYY h:mm A");
    $scope.checkOutTime = moment($scope.parkingLotService['checkOutTime']).format("MMM D, YYYY h:mm A");
    $scope.userFullName = $scope.parkingLotService.user.full_name;

    //console.log($scope.parkingLotService.user);
    $scope.submitVehicleDetail = function(){
        //alert($scope.state);
        console.log('vehicle submitted')
       $http.post($rootScope.API_URL+"/api/add-vehicle/"+$scope.reservationId+'/', {user:$rootScope.gp_userId, make:$scope.make, model:$scope.model, color:$scope.color, license:$scope.license, state:$scope.state} ).then(function(response) {
            console.log(response);

            //Update netpark reservation with this vehicle
            $http.put($rootScope.API_URL+"/api/netpark/"+$scope.reservationId+'/', {make:$scope.make, model:$scope.model, color:$scope.color, license:$scope.license, state:$scope.state} ).then(function(response) {
                console.log(response);

            });

        });
    }


    $http.get($rootScope.API_URL+"/api/user/"+$rootScope.gp_userId+"/vehicle/" ).then(function(response) {
        console.log(response);
        var vehicle =  response.data.results;
        if(vehicle.length < 1){
            $timeout(function(){
                angular.element('#vehicle-detail').modal('toggle');
            },3000);
        }else{
            $scope.make = vehicle[0].make;
            $scope.model = vehicle[0].model;
            $scope.color = vehicle[0].color;
            $scope.license = vehicle[0].license;
            $scope.state = vehicle[0].state;
        }

    });

	//Model Typeaheads
	$('input.model').typeahead({
        source: [
            {
                id: "0",
                name: "1980"
            }, {
                id: "1",
                name: "1981"
            }, {
                id: "2",
                name: "1982"
            }, {
                id: "3",
                name: "1983"
            }, {
                id: "4",
                name: "1984"
            }, {
                id: "5",
                name: "1985"
            }, {
                id: "6",
                name: "1986"
            }, {
                id: "7",
                name: "1987"
            }, {
                id: "8",
                name: "1988"
            }, {
                id: "9",
                name: "1989"
            }, {
                id: "10",
                name: "1990"
            }, {
                id: "11",
                name: "1991"
            }, {
                id: "12",
                name: "1992"
            }, {
                id: "13",
                name: "1993"
            }, {
                id: "14",
                name: "1994"
            }, {
                id: "15",
                name: "1995"
            }, {
                id: "16",
                name: "1996"
            }, {
                id: "17",
                name: "1997"
            }, {
                id: "18",
                name: "1998"
            }, {
                id: "19",
                name: "1999"
            }, {
                id: "20",
                name: "2000"
            }, {
                id: "21",
                name: "2001"
            }, {
                id: "22",
                name: "2002"
            }, {
                id: "23",
                name: "2003"
            }, {
                id: "24",
                name: "2004"
            }, {
                id: "25",
                name: "2005"
            }, {
                id: "26",
                name: "2006"
            }, {
                id: "27",
                name: "2007"
            }, {
                id: "28",
                name: "2008"
            }
        ],
        autoSelect: true,
        afterSelect:function(){
            $timeout(function(){
                angular.element('input.model').blur();
            },500);
        }
    });
    // Make Typeaheads
    $('input.make').typeahead({
        source: [
            {
                id: "0",
                name: "Corolla"
            }, {
                id: "1",
                name: "BMW"
            }, {
                id: "2",
                name: "Mercedes"
            }, {
                id: "3",
                name: "Jaguaar"
            }, {
                id: "4",
                name: "Suzuki"
            }
        ],
        autoSelect: true,
        afterSelect:function(){
            $timeout(function(){
                angular.element('input.make').blur();
            },500);
        }
    });
    // state Typeaheads
    $('input.state').typeahead({
        source: [
            {
                id: "1",
                name: "Alabama"
            }, {
                id: "2",
                name: "Alaska"
            }, {
                id: "3",
                name: "Arizona"
            }, {
                id: "4",
                name: "Arkansas"
            },
            {
                id: "5",
                name: "Connecticut"
            }, {
                id: "6",
                name: "Delaware"
            }, {
                id: "7",
                name: "Florida"
            }, {
                id: "8",
                name: "Georgia"
            }
        ],
        autoSelect: true,
        afterSelect:function(){
            $timeout(function(){
                angular.element('input.state').blur();
            },500);
        }
    });
}]);
