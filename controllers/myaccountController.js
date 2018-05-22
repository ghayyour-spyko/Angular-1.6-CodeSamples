app.controller('myaccountController', ['$scope', '$rootScope', '$http', 'toastr', '$location', 'parkingLotService', '$filter', function($scope, $rootScope, $http, toastr, $location, parkingLotService, $filter) {
    console.log("In myaccount Controller");
    $rootScope.headerClass = false;
    $rootScope.headerClassSearchPage = true;
    new CBPFWTabs(document.getElementById('tabs'));

    $scope.bookings = [];
    $scope.profile = {};
    $scope.vehicle = {};
    $scope.card = {};
    $scope.has_card = false;

    $scope.isCancelling = false;

    $scope.itemsPerPage = 10;
    $scope.pagedBookings = [];
    $scope.currentPage = 0;

    $scope.buttons = { cardBtn: 'Save', vehicleBtn: 'Save' };


    $http.get($rootScope.API_URL+"/api/user/reservation/" , {cache: false}).then(function(response) {
        //console.log('Reservations :: '  + JSON.stringify(response));
        var results = response.data.results;
        for (record in results) {
            var date_arr = results[record].date_paid.split(' ');
            results[record].day = date_arr[2];
            results[record].day_of_week = date_arr[0];
            results[record].month = date_arr[1];
        }
        $scope.bookings = results;

        $scope.groupToPages();
    });

    $scope.groupToPages = function () {
        $scope.pagedBookings = [];
        
        for (var i = 0; i < $scope.bookings.length; i++) {
            if (i % $scope.itemsPerPage === 0) {
                $scope.pagedBookings[Math.floor(i / $scope.itemsPerPage)] = [ $scope.bookings[i] ];
            } else {
                $scope.pagedBookings[Math.floor(i / $scope.itemsPerPage)].push($scope.bookings[i]);
            }
        }

        //console.log($scope.pagedBookings);
    };

    $scope.range = function (start, end) {
        var ret = [];
        if (!end) {
            end = start;
            start = 0;
        }
        for (var i = start; i < end; i++) {
            ret.push(i);
        }
        return ret;
    };
    
    $scope.prevPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };
    
    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pagedBookings.length - 1) {
            $scope.currentPage++;
        }
    };
    
    $scope.setPage = function () {
        $scope.currentPage = this.n;
    };

    $http.get($rootScope.API_URL+"/api/user/profile/", {cache: false}).then(function(response) {
        console.log(response);
        $scope.profile = response.data.results[0];
        $scope.new_email = $scope.profile.user.email;

    });
    $http.get($rootScope.API_URL+"/api/user/"+$rootScope.gp_userId+"/vehicle/", {cache: false}).then(function(response) {
        //console.log(response);
        if (response.data.results.length > 0) {
            $scope.vehicle = response.data.results[0];
            $scope.buttons.vehicleBtn = 'Update';
        }
    });
    $http.get($rootScope.API_URL+"/api/user/card/").then(function(response) {
        //console.log(response);
        if (response.data.results.length > 0) {
            $scope.card = response.data.results[0];
            $scope.has_card = true;
            $scope.buttons.cardBtn = 'Replace Card';
        }
    });






    $scope.addVehicle = function() {
        var v = $scope.vehicle;
        var vehicle = { make: v.make, model: v.model, color: v.color, license: v.license, state: v.state };

        var url = $rootScope.API_URL+"/api/user/vehicle/";
        if ($scope.buttons.vehicleBtn === 'Update') {
            $http.put(url + $scope.vehicle.id + '/', vehicle).then(function(response) {
                toastr.success('Updated!', 'Vehicle Updated');
            });
        } else {
            $http.post(url, vehicle).then(function(response) {
                console.log(response);
                $scope.vehicle = response.data;
                $scope.buttons.vehicleBtn = 'Update';
                toastr.success('Updated!', 'Vehicle Added');
            });


        }


    };

    $scope.addCard = function() {
        var c = $scope.card;
        var card = { name: c.name, number: c.number, expire_date: c.expire_date, ccv: c.ccv }
        var url = $rootScope.API_URL+"/api/user/card/";
        if ($scope.buttons.cardBtn === 'Replace Card') {
            $http.put(url + $scope.card.id + '/', card).then(function(response) {
                toastr.success('Updated!', 'Card Updated.');
            });
        } else {
            $http.post(url, card).then(function(response) {
                console.log(response);
                $scope.card = response.data;
                $scope.has_card = true;
                $scope.buttons.cardBtn = 'Replace Card';
                toastr.success('Updated!', 'Card Added');
            });
        }

    };

    $scope.updateProfile = function() {
        console.log(JSON.stringify($scope.profile))
        $http.put($rootScope.API_URL+'/api/user/profile/' + $scope.profile.id + '/', $scope.profile).then(function(response) {
            console.log(response);
            toastr.success('Updated!', 'Your Profile is updates successfully.');
            angular.element('#edit-profile').removeClass("active");
            angular.element('#Profile').addClass("active");
        });
    };

    $scope.changePassword = function() {
        if ($scope.new_password === $scope.confirm_new_password) {
            $http.post($rootScope.API_URL+'/api/change-profile/', { field: 'password', old_password: $scope.old_password, new_password: $scope.new_password }).then(function(response) {
                    console.log(response);
                if(response.data.success){
                    toastr.success('Updated!', response.data.message);
                    angular.element('#change-password').removeClass("active");
                    angular.element('#Profile').addClass("active");
                }else{
                    toastr.error('Error!', response.data.message);
                }
            });
        } else {
            toastr.error('Error!', 'Password do not match!');
        }
    };

    $scope.changeEmail = function() {
        if ($scope.new_email != "") {
            $http.post($rootScope.API_URL+'/api/change-profile/', { field: 'email', new_email: $scope.new_email }).then(function(response) {
                $scope.profile.user.email=$scope.new_email;
                toastr.success('Updated!', response.data.message);
                angular.element('#change-email').removeClass("active");
                angular.element('#Profile').addClass("active");
            });
        } else {
            toastr.error('Error!', 'New email did not matched');
        }
    };

    $scope.comparePswd = function(pass1, pass2) {
        if (pass1 === pass2) {
            return true;
        } else {
            return false;
        }
    }


    function formatUnixToDateTime(unix_time){
        var formatted = $filter('date')(new Date(unix_time*1000), 'MMM dd, yyyy h:mm a','UTC');
        // var formatted = moment.unix(unix_time).format("MMM Do, YYYY h:mm a");
        return formatted;
}

    $scope.view_reservation = function(reservation_id){
        
        for(book in $scope.bookings){
            var booking = $scope.bookings[book];
            if(parseInt(booking.id) === parseInt(reservation_id)){
                reservation = {id: reservation_id};
                transaction = {deposit_due_now: parseFloat(booking.amount_paid).toFixed(2), 
                    due_at_lot:booking.due_at_lot, 
                    tax_fee:booking.taxfee_paid, 
                    sub_total: parseFloat(booking.due_at_lot + booking.amount_paid - booking.taxfee_paid).toFixed(2),
                    total: (booking.due_at_lot + booking.amount_paid)
                 };
                user = {full_name:($scope.profile.user.first_name +' '+ $scope.profile.user.last_name) }
                parkingLotService.setValue('parkingLot',booking.parkinglot);
                parkingLotService.setValue('reservation', reservation);
                parkingLotService.setValue('checkInTime', formatUnixToDateTime(booking.date_check_in));
                parkingLotService.setValue('checkOutTime', formatUnixToDateTime(booking.date_check_out));
                parkingLotService.setValue('start', '');
                parkingLotService.setValue('end', '');
                parkingLotService.setValue('user', user );
                parkingLotService.setValue('transaction', transaction);

                $location.path("/confirmation");
            }
        }

    };

    $scope.email_receipt = function(reservation_id) {

        $http.post($rootScope.API_URL+'/api/email-receipt/' + reservation_id + '/').then(function(response) {
            console.log(response);
            toastr.success('Success!', 'Receipt sent to your email');
        });
    };

    $scope.cancel_reservation = function(reservation_id) {
        $scope.isCancelling = true;
        $http.post($rootScope.API_URL+'/api/cancel-reservation/' + reservation_id + '/').then(function(response) {
            //console.log(response);
            if(response.data.success === true){
                for(book in $scope.bookings){
                    var b = $scope.bookings[book];
                    if(b.id == reservation_id){
                        //$scope.bookings.splice(book,1);
                        $scope.bookings[book].status = "Cancelled";
                        break;
                    }
                }
                toastr.success('Success!', 'Reservation Cancelled');
            }else{
                toastr.error('Error!', response.data.message);
            }
            $scope.isCancelling = false;
        });
    };

}]);
