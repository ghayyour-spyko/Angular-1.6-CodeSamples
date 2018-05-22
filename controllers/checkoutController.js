app.controller('checkoutController', ['$scope', '$route', '$rootScope', '$http', 'parkingLotService', 'couponService', '$cookies', '$cookieStore', '$timeout', '$location', '$filter', 'jwtHelper', 'toastr', 'Analytics', function($scope, $route, $rootScope, $http, parkingLotService, couponService, $cookies, $cookieStore, $timeout, $location, $filter, jwtHelper, toastr, Analytics) {
    console.log("In checkout Controller");
    console.log("Location : ", $location.$$host)
    $rootScope.headerClass = false;

    $scope.username = "";
    $scope.password = "";
    $scope.terms = "";
    $scope.guest = {};
    $scope.card = {};
    $scope.coupon = { applied: false, code:'' };
    $scope.new_card = true;
    $scope.show_card_radio = false;
    $scope.coupon_applied = false;
    $scope.total_reservations = 0;
    $scope.calculation = {};

    $scope.parkingLotService = parkingLotService.getValue();

    console.log($scope.parkingLotService);

    try {
        if (typeof($scope.parkingLotService.parkingLot['id']) == "undefined") {
            $location.path("/");
        }
        else
        {
            $scope.parkingLotId = $scope.parkingLotService.parkingLot['id'];
        }
    } catch (err) {
        $location.path("/");
    }

    angular.element(".comodoLogoContent").html(angular.element("#comodo-logo-content").html());
    //console.log($scope.parkingLotService);
    angular.element('[data-toggle="popover"]').popover();
    $scope.cardToggle = function(card) {
        if (card == 'new') {
            $scope.new_card = true;
            $scope.card.number = '';
            $scope.card.zipcode = '';
            $scope.card.expire_date = '';
            $scope.card.ccv = '';
        } else {
            $scope.new_card = false;
        }
    }

    $scope.comparePswd = function(pass1, pass2) {
        if (pass1 === pass2) {
            return true;
        } else {
            return false;
        }
    }
    
    $scope.showPhoneNumber = function() {
        console.log($scope.phone_number);
    }
    $scope.switchCheckoutType = function(selected) {
        if (selected == 'guest') {
            $scope.showForms();
        } else {
            $scope.createAccount();
        }
    }
    $scope.init = function() {
        $scope.login_type = 'guest';
        //console.log($rootScope.gp_loggedIn)
        if ($rootScope.gp_loggedIn === true) {
            $scope.login_type = '';
        }

        $timeout(function() {
            if (angular.element(window).width() > 992) {
                angular.element('#sidebar').theiaStickySidebar({
                    additionalMarginTop: 50
                });
            }
        }, 3000);
    }


    $scope.init();
    $scope.backgroundImage = $rootScope.gp_userSearch.airport_background;

    $scope.start = $scope.parkingLotService['start'];
    $scope.end = $scope.parkingLotService['end'];
    // parkingLotService.setValue('start', '');
    // parkingLotService.setValue('end', '');
    $scope.checkInTime = $scope.parkingLotService['checkInTime'];
    $scope.checkOutTime = $scope.parkingLotService['checkOutTime'];

    $scope.checkIn = $scope.start + ' ' + $scope.checkInTime;
    $scope.checkOut = $scope.end + ' ' + $scope.checkOutTime;

    $scope.fee_html = '';
    $scope.tax_html = '';

    


    /* terms */

    $http.get($rootScope.API_URL + '/api/gp-settings/terms/').then(function(response) {
        try {
            $scope.terms = response.data.result.value;

        } catch (err) {

        }
    });

    /* terms */

    /* cards */

    if($rootScope.gp_userId)
    {
        $http.get($rootScope.API_URL + '/api/user/card/').then(function(response) {
            try {
                var cards = response.data.results;
                if (cards.length > 0) {
                    $scope.card = cards[0];
                    $scope.show_card_radio = true;
                    $scope.new_card = false;
                }

            } catch (err) {
                //alert(err);
            }
        },
        function(data) {
            // Handle error here
        });
    }   

    /* cards */


    $scope.changeTime = function(){
        if($scope.times.indexOf($scope.checkInTime) === -1) {
            $scope.checkInTime    = $scope.times[0];
        }
        if($scope.endtimes.length==0)
        {
            $scope.end          = moment($scope.start).add(1, "days").format("MMM DD, YYYY");
            $scope.mobileend    = new Date(moment($scope.start).add(1, "days"));

            angular.element('#final-timings input.end').val("");
            angular.element('#final-timings input.end').focus();

            $scope.times        = $rootScope.start_time_series($scope.start);
            $scope.endtimes     = $rootScope.start_time_series($scope.end,$scope.start,$scope.checkInTime);
            $scope.changeTime();
        }

        if($scope.endtimes.indexOf($scope.checkOutTime) === -1) {
            $scope.checkOutTime      = $scope.endtimes[0];
        }
    }


    $scope.calculate_payment = function(caller) {
        console.log($rootScope.airport_name);
        $rootScope.gp_userSearch = { 'airport_name': $rootScope.gp_userSearch.airport_name, 'date_check_in': $scope.start, 'time_check_in': $scope.checkInTime, 'date_check_out': $scope.end, 'time_check_out': $scope.checkOutTime, 'airport_background': $scope.backgroundImage, 'type': 'local' }
        var payload = {
            parkinglot_id: $scope.parkingLotId,
            date_check_in: $scope.checkIn,
            date_check_out: $scope.checkOut,
            coupon: $scope.coupon.code
        };
        
        $http.post($rootScope.API_URL + '/api/checkout/calculation/', payload).then(function(response) {
            try {
                var calculation = response.data.data;
                $scope.calculation = calculation;
                console.log(calculation);


                if(caller == 'coupon'){
                    if(calculation.coupon.applied){
                        toastr.info('Success!', 'coupon applied');
                    }else{
                        toastr.error('Error!', 'Invalid coupon');
                    }
                }


                $scope.parkingSubtotal = calculation.parkingSubtotal.toFixed(2);
                $scope.taxFee = calculation.taxFeeTotal.toFixed(2);
                $scope.total = calculation.total.toFixed(2);
                $scope.dueAtLot = calculation.dueAtLot.toFixed(2);
                $scope.depositDueNow = calculation.depositDueNow.toFixed(2);
                $scope.coupon = calculation.coupon;

                $scope.tax_html = '';
                
                
                $scope.taxList = calculation.taxes;
                var taxes = 0;
                for (i=0;i<$scope.taxList.length;i++) {
                    var tax = $scope.taxList[i];
                    $scope.tax_html += tax.description + ' : <span class="pull-right">$ ' + parseFloat(tax.price).toFixed(2) + '</span>';
                    if (i != $scope.taxList.length - 1) {
                        $scope.tax_html += '<br>';
                    }

                }

                $scope.fee_html = '';
                $scope.otherFeesList = calculation.fees;
                for (i=0;i<$scope.otherFeesList.length;i++) {

                    var fee = $scope.otherFeesList[i];
                    $scope.fee_html += fee.description + ' : <span class="pull-right">$ ' + parseFloat(fee.price).toFixed(2) + '</span>';
                    if (i != $scope.otherFeesList.length - 1) {
                        $scope.fee_html += '<br>';
                    }
                }

            } catch (err) {
                console.log('error on calculation :: ' + err);
            }
        },
        function(err) {
           console.log('error on calculation :: ' + err);
        })

    };


    $scope.calculate_payment('default');

    $scope.userCreds = [];
    $scope.login_user = function() {
        console.log("User Creds are: ", $scope.userCreds);
        $http.post($rootScope.API_URL + "/api/login/", { 'username': $scope.userCreds.username, 'password': $scope.userCreds.password }).then(function(response) {
            var token = response.data.token;
            if (typeof(token) != 'undefined') {

                var userid = jwtHelper.decodeToken(token).user_id;
                console.log('logged in user : ' + userid);

                $rootScope.gp_userId = userid;
                $rootScope.gp_loggedIn = true;
                $rootScope.gp_userToken = token
                $cookieStore.put('gp_loggedIn', $rootScope.gp_loggedIn);
                $cookieStore.put('gp_userId', $rootScope.gp_userId);
                $cookieStore.put('gp_userToken', $rootScope.gp_userToken);

                $http.defaults.headers.common['Authorization'] = 'JWT ' + $rootScope.gp_userToken;


                $timeout(function() {
                    $route.reload();
                }, 300);

            } else {
                //alert(response.data.message);
                toastr.error('Error!', response.data.message);
            }
        }, function(response) {
            toastr.error('Error!', 'Invalid credentials');
        });

    };

 
    $scope.closeModal = function() {

        // parkingLotService.setValue('start', $scope.start2);
        // parkingLotService.setValue('end', $scope.end2);
        parkingLotService.setValue('start', $scope.start);
        parkingLotService.setValue('end', $scope.end);
        parkingLotService.setValue('checkInTime', $scope.checkInTime);
        parkingLotService.setValue('checkOutTime', $scope.checkOutTime);

        $scope.checkIn = $scope.start + ' ' + $scope.checkInTime;
        $scope.checkOut = $scope.end + ' ' + $scope.checkOutTime;
        $scope.calculate_payment('default');
    }

    $scope.showForms = function() {
        var checkout_type = document.querySelector('input[name="login_type"]:checked').value;
        if (checkout_type == "guest") {
            angular.element("#guest").slideDown();
            angular.element("#member").slideUp();
        } else {
            angular.element("#member").slideDown();
            angular.element("#guest").slideUp();
        }
    }
    $scope.closeModal3 = function() {
        angular.element('#final-timings').modal('toggle');
        $timeout(function() {
            $location.path("/confirmation");
        }, 300);
    };

    $scope.createAccount = function() {
        // console.log('in create account function');
        // angular.element("#account_div").slideDown();
        // angular.element("#account_div").slideUp();
    }

    var starttDate = moment().add(1, "days");
    var enddDate = moment().add(3, "days");
    //For new datepicker
    $scope.minDate = new Date();
    $('#final-timings .input-daterange').datepicker({
        startDate: $scope.minDate,
        format: "M dd, yyyy",
        todayHighlight: true,
        orientation: 'bottom auto',
    }, applyExistingValues());
    // Apply the existing values so that start date don't change when we change end date
    function applyExistingValues() {
        if ($scope.start != "" && $scope.end != "") {
            angular.element('#final-timings input.start').val($scope.start);
            angular.element('#final-timings input.end').val($scope.end);

            $scope.mobilestart      = new Date(moment($filter('date')($scope.start, "yyyy-MM-dd")));
            $scope.mobileminstart   = moment().format("YYYY-MM-DD");

            $scope.mobileend        = new Date(moment($filter('date')($scope.end, "yyyy-MM-dd")));
            $scope.mobileminend     = moment().format("YYYY-MM-DD");

            $scope.times        = $rootScope.start_time_series($scope.start);
            $scope.endtimes     = $rootScope.start_time_series($scope.end,$scope.start,$scope.checkInTime);
            $scope.changeTime();
        }
    }
    angular.element('#final-timings input.start').change(function(e) {
        $(this).datepicker('hide');
        e.preventDefault();
        angular.element('#final-timings input.start').blur();
        angular.element('#final-timings input.end').focus();
    });
    angular.element('#final-timings input.end').change(function(e) {
        $timeout(function() {
            $('#final-timings input.end').datepicker('hide');
            e.preventDefault();
            angular.element('#final-timings input.end').blur();
            $scope.times            = $rootScope.start_time_series($scope.start);
            $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.checkInTime);
            $scope.changeTime();
        }, 1000);
    });


    $scope.mobileDateChange = function(e){
        if(e=="start")
        {
            if($scope.mobilestart)
            {
                $scope.start = moment($scope.mobilestart).format('MMM DD, YYYY');

                if(moment($scope.start) > moment($scope.mobileend))
                {
                    $scope.mobileend    = new Date($scope.start);
                }

                $scope.end              = moment($scope.mobileend).format('MMM DD, YYYY');
            }
        }
        else if(e=="end")
        {
            if($scope.end)
            {
                $scope.end = moment($scope.mobileend).format('MMM DD, YYYY');

                if(moment($scope.end) < moment($scope.start))
                {
                    $scope.mobilestart          = new Date($scope.end);

                    $scope.start                = moment($scope.mobilestart).format('MMM DD, YYYY');
                    $scope.mobileminstart       = moment(new Date($scope.end)).format("YYYY-MM-DD");
                }

                $scope.times            = $rootScope.start_time_series($scope.start);
                $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.checkInTime);
                $scope.changeTime();
            }
        }
    }

    $scope.$watch("start", function() {
        $scope.times            = $rootScope.start_time_series($scope.start);
        $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.checkInTime);
        $scope.changeTime();
    });

    $scope.$watch("end", function() {
        //console.log("End Updated");
        //$scope.times            = $rootScope.start_time_series($scope.start);
        //$scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.st.checkInTime);
        //$scope.changeTime();
    });

    $scope.$watch("checkInTime", function() {
        //console.log("checging time");
        $scope.times            = $rootScope.start_time_series($scope.start);
        $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.checkInTime);
        $scope.changeTime();
    });

    $scope.checkoutFormSubmit = [];
    $scope.checkoutFormSubmit.error = '';
    $scope.complete_purchase = function() {
        //console.log(submitted_data);
        // console.log("Artificial console::", $scope.card.number,
        //     $scope.card.zipcode,
        //     $scope.card.expire_date,
        //     $scope.card.security_code, "phone_number:", $scope.guest.phone);
        var cardDetails = { new_card: $scope.new_card, card_number: $scope.card.number, zipcode: $scope.card.zipcode, expire_date: $scope.card.expire_date, ccv: $scope.card.ccv };
        var user = { logged_in: $rootScope.gp_loggedIn, gp_user_id: $rootScope.gp_user_id };
        var guest = {};
        if ($rootScope.gp_loggedIn == false) {
            guest = { first_name: $scope.guest.first_name, last_name: $scope.guest.last_name, email: $scope.guest.email, phone: $scope.guest.phone, create_account: $scope.guest.create_account }
            if (guest.create_account === true) {
                guest.password = $scope.guest.password1;
            }
        } else {
            user['user_id'] = $rootScope.gp_userId;
        }



        var reservationData = {
            coupon: $scope.coupon,
            user: user,
            guest: guest,
            cardDetails: cardDetails,
            parking_lot: $scope.parkingLotId,
            daily_rate: $scope.calculation.dailyRate,
            fee_type: $scope.calculation.fee_type,
            fee_value: $scope.calculation.variable_fee,
            prepaid_nr_gross: $scope.calculation.prepaid_nr_gross,
            billable_days: $scope.calculation.billableDays,
            rental_days: $scope.calculation.rentalDays,
            date_check_in: $scope.checkIn,
            date_check_out: $scope.checkOut,
            total: $scope.calculation.total,
            due_at_lot: $scope.dueAtLot,
            deposit_due_now: $scope.calculation.depositDueNow,
            sub_total: $scope.calculation.parkingSubtotal,
            tax_fee: $scope.calculation.taxFeeTotal
        }

        parkingLotService.setValue('transaction', reservationData);
        parkingLotService.setValue('checkInTime', $scope.checkIn);
        parkingLotService.setValue('checkOutTime', $scope.checkOut);

        //console.log(JSON.stringify(reservationData))
        //return;

        $http.post($rootScope.API_URL + "/api/checkout/", reservationData).then(function(response) {
            console.log(' Checkout Response ::: ' + response.data.message);
            // console.log(response.status);
            // console.log(response.data);
            var reservation = { id: response.data.result.reservation_id }
            parkingLotService.setValue('reservation', reservation);
            if (response.data.success === true) {
                if ($rootScope.gp_loggedIn == false) {
                    $rootScope.gp_userId = response.data.user_id;
                }
                user = { full_name: response.data.result.user.full_name }
                // console.log(response.data);
                // console.log('user::', user);
                parkingLotService.setValue('user', user);

                // Add calls as desired - See below 
                // Create transaction 

                if ($scope.coupon_applied === false) {
                    $scope.tmp_rev = parseFloat(reservationData.daily_rate) + parseFloat(5.00);
                } else {
                    $scope.tmp_rev = parseFloat($scope.depositDueNow);
                }
                if ($location.$$host != "dev.gotparking.com") {
                    Analytics.addTrans('GOT-' + response.data.result.reservation_id, 'Gotparking Revenue', $scope.tmp_rev.toFixed(2), '0', '0', 'Amsterdam', '', 'Netherlands', 'USD');

                    // Analytics.addTrans({
                    //       'id': response.data.result.reservation_id,            // Transaction ID. Required.
                    //       'affiliation': 'Reservation',                         // Affiliation or store name.
                    //       'revenue': reservationData.total,                     // Grand Total.
                    //       'tax': $scope.taxFee,                                 // Tax.
                    //       'shipping': '0',                                      // Shipping.
                    //       'currency': 'USD'                                     // local currency code.
                    //     });

                    // Add items to transaction 
                    Analytics.addItem('GOT-' + response.data.result.reservation_id, reservationData.parking_lot, $scope.parkingLotService.parkingLot.name, 'reservation', $scope.tmp_rev.toFixed(2), '1');

                    // Analytics.addItem({
                    //     'id': response.data.result.reservation_id,              // Transaction ID. Required.
                    //     'name': $scope.parkingLotService.parkingLot.name,       // Product name. Required.
                    //     'sku': reservationData.parking_lot,                     // SKU/code.
                    //     'category': 'Reservations',                             // Category or variation.
                    //     'price': reservationData.daily_rate,                    // Unit price.
                    //     'quantity': '1',                                        // Quantity.
                    //   });

                    // Complete transaction 
                    Analytics.trackTrans();

                    // Clear transaction 
                    Analytics.clearTrans();
                    console.log('pushed success transaction data');
                } else { console.log("Disable analytics as its dev"); } // End of disabling analytics if
                console.log('id' + response.data.result.reservation_id + 'revenue' + reservationData.total + 'coupon' + reservationData.coupon + 'products name' + $scope.parkingLotService.parkingLot.name + 'id' + reservationData.parking_lot + 'price' + reservationData.daily_rate + 'category' + 'reservation' + 'quantity' + 1 + 'dimension1' + reservationData.date_check_in +
                    'dimension2' + reservationData.date_check_out);
                $timeout(function() {
                    $location.path("/confirmation");
                }, 300);
            } else {
                $scope.checkoutFormSubmit.error = response.data.message;
            }
        });
    };
}]);