app.controller('parkingLotController', ['$scope', '$rootScope', '$timeout', '$location', '$http', '$routeParams','$filter', 'parkingLotService', '$cookieStore', 'ngMeta', 'toastr', function($scope, $rootScope, $timeout, $location, $http, $routeParams,$filter, parkingLotService, $cookieStore, ngMeta, toastr) {
    console.log("In parking Lot Controller!");
    $scope.parkinglot_code = $routeParams.parkinglot_code;
    $scope.parkingLotId = false;
    $scope.airport_code = $routeParams.airport_code;
    $scope.ct = {};
    try {
        //alert($cookieStore.get('gp_userSearch').airport_name)
        var cache = $cookieStore.get('gp_userSearch');
        
        $scope.start    = cache.date_check_in;


        if(!$scope.start || (moment($scope.start) < moment(moment().format('MMM DD, YYYY'))))
        {
            $scope.start        = moment().format('MMM DD, YYYY');
        }

        $scope.end      = cache.date_check_out;

        if(!$scope.end)
        {
            $scope.end      =  moment($scope.start).add(3, "days").format('MMM DD, YYYY');
        }

        if(cache.time_check_in)
        {
            $scope.ct.checkInTime   = cache.time_check_in;
            $scope.ct.checkOutTime  = cache.time_check_out;
        }
        else
        {
            $scope.ct.checkInTime   = "6:00 AM";
            $scope.ct.checkOutTime  = "6:00 PM";
        }

        console.log($scope.start);

        $scope.backgroundImage = cache.airport_background;
        //angular.element('.mobi_start').addClass('used');
        //angular.element('.mobi_end').addClass('used');
    } catch (err) {
        console.log(err);
        console.log('this error');
    }

    $scope.hasUserReservations = false;
    $scope.parkingLot = {};
    $scope.airport = {};
    $scope.reviews = {};
    $scope.media = [];
    $http.get($rootScope.API_URL + "/api/airport/" + $scope.airport_code + "/parkinglotdetail/" + $scope.parkinglot_code + "/").then(function(response) {
        console.log('CULPLET');
        console.log(response.data);
        $scope.parkingLot = response.data.result.parkingLot;
        $scope.airport = response.data.result.airport;
        $scope.reviews = response.data.result.reviews;
        $scope.parkingLotId = $scope.parkingLot.id;
        $scope.parkingLot.label = parseFloat($scope.parkingLot.daily_rate).toFixed(2).toString();

        ngMeta.setTitle($scope.parkingLot.meta_title);
        ngMeta.setTag('description', $scope.parkingLot.meta_description);

        // Analytics code
        dataLayer.push({
            'ecommerce': {
                'detail': {
                    'products': [{
                        'name': response.data.result.parkingLot.name,
                        'id': response.data.result.parkingLot.id,
                        'category': 'reservation'
                    }]
                }
            }
        });
        console.log('pushed the analytics');
        $http.get($rootScope.API_URL + "/api/get-media/?model=ParkingLot&id=" + $scope.parkingLotId).then(function(response) {
            $scope.media = response.data.result;
            $timeout(function() {
                angular.element('.slider-pro').sliderPro({
                    width: 960,
                    height: 500,
                    fade: true,
                    arrows: true,
                    buttons: false,
                    fullScreen: false,
                    smallSize: 500,
                    startSlide: 0,
                    mediumSize: 1000,
                    largeSize: 3000,
                    thumbnailArrows: true,
                    autoplay: false
                });
            }, 1000);
        });

        $http.get($rootScope.API_URL + "/api/parkinglot/" + $scope.parkingLotId + "/reservations/").then(function(response) {
            var reservations = response.data.reservations;
            //alert(reservations)
            if (reservations > 0) {
                $scope.hasUserReservations = true;
            }

        }, function(response) {
            // body...
        });

        var mapArray=[{
                name: 'Parkin Lot',
                location_latitude: $scope.parkingLot.location_latitude,
                location_longitude: $scope.parkingLot.location_longitude,
                map_image_url: 'img/thumb_map_1.jpg',
                name_point: 'Address',
                description_point: $scope.parkingLot.address,
                url_point: '',
                pin:'img/pins/parking.png'
            },
            {
                name: 'Airport',
                location_latitude: response.data.result.airport.latitude,
                location_longitude: response.data.result.airport.longitude,
                map_image_url: response.data.result.airport.image,
                name_point: 'Address',
                description_point: response.data.result.airport.name,
                url_point: '',
                pin:'img/pins/airport.png'
            }];
        //Draw map
        drawMap(mapArray);
    });

    $scope.changeTime = function(){
        //console.log($scope.endtimes);
        if($scope.times.indexOf($scope.ct.checkInTime) === -1) {
            $scope.ct.checkInTime    = $scope.times[0];
        }

        if($scope.endtimes.length==0)
        {
            $scope.end          = moment($scope.start).add(1, "days").format("MMM DD, YYYY");
            $scope.mobileend    = new Date(moment($scope.start).add(1, "days"));

            angular.element('#sidebar input.end').val("");
            angular.element('#sidebar input.end').focus();

            $scope.times        = $rootScope.start_time_series($scope.start);
            $scope.endtimes     = $rootScope.start_time_series($scope.end,$scope.start,$scope.ct.checkInTime);
            $scope.changeTime();
        }

        if($scope.endtimes.indexOf($scope.ct.checkOutTime) === -1) {
            $scope.ct.checkOutTime      = $scope.endtimes[0];
        }
    }

    $scope.$watch("start", function() {
        $scope.times            = $rootScope.start_time_series($scope.start);
        $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.ct.checkInTime);
        $scope.changeTime();
    });

    $scope.$watch("end", function() {
        //console.log("End Updated");
        //$scope.times            = $rootScope.start_time_series($scope.start);
        //$scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.starttime);
        //$scope.changeTime();
    });

    $scope.$watch("ct.checkInTime", function() {
        $scope.times            = $rootScope.start_time_series($scope.start);
        $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.ct.checkInTime);
        $scope.changeTime();
    });

    $rootScope.headerClass = false;

    $scope.reserveNow = function() {
        //angular.element('#confirm-timings').modal('toggle');

        $http.get($rootScope.API_URL + "/api/parkinglot/"+$scope.parkinglot_code.toLowerCase()+"/blackout?date_check_in="+moment($scope.start).format('YYYY-MM-DD')+"&date_check_out="+moment($scope.end).format('YYYY-MM-DD')).then(function(response) {
            if(!response.data.is_blackout)
            {
                var checkIn     = $scope.start + ' ' + $scope.ct.checkInTime;
                var checkOut    = $scope.end + ' ' + $scope.ct.checkOutTime;

                //parkingLotService.setValue('id', $scope.parkingLot.id);
                //parkingLotService.setValue('dailyRate', $scope.parkingLot.daily_rate);
                parkingLotService.setValue('parkingLot', $scope.parkingLot);
                parkingLotService.setValue('start', $scope.start);
                parkingLotService.setValue('end', $scope.end);
                parkingLotService.setValue('checkInTime', $scope.ct.checkInTime);
                parkingLotService.setValue('checkOutTime', $scope.ct.checkOutTime);
                $timeout(function() {
                    $location.path("/checkout");
                }, 300);
            }
            else
            {
                toastr.error('Error!', "Parking lot is not available for selected date range.");
            }
        });
    };

    $scope.getRatingsArray = function(rating) {
        var arr = getRatings(rating);
        return arr;
    }
    $scope.retAverage= function(a,b,c,d){
        return (parseInt(a)+parseInt(b)+parseInt(c)+parseInt(d))/4;
    }

    $scope.addReview = function() {
        angular.element('#myReview').modal('toggle');
        $scope.review.parking_lot_id = $scope.parkingLotId;
        $http.post($rootScope.API_URL + "/api/review/", $scope.review).then(function(response) {
            if (response.status == 201) {
                $scope.reviews.push($scope.review);
                toastr.success('Success!', 'Review Added!');
            } else {
                toastr.error('Error!', 'Something is not right, please try later');
            }
        });
    }



    $(function() {
        'use strict';
        $('#single_tour_feat a[href*=#]:not([href=#])').click(function() {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top - 90
                }, 500);
                return false;
            }
        });
    });

    $scope.init = function() {
        $timeout(function() {
            if (angular.element(window).width() > 992) {
                angular.element('#sidebar').theiaStickySidebar({
                    additionalMarginTop: 50
                });
            }
        }, 3000);
    };


    $(document).ready(function() {

        $scope.init();
        $(window).resize(function() {
            $scope.init();
        })
    });
    angular.element('.parallax-window').parallax({ bleed: 10 });
    
    //For new datepicker
    $scope.minDate = new Date();
    $('#sidebar .input-daterange').datepicker({
        startDate: $scope.minDate,
        format: "M dd, yyyy",
        todayHighlight: true,
        orientation: "bottom left",
    }, applyExistingValues());
    // Apply the existing values so that start date don't change when we change end date
    function applyExistingValues() {
        if ($scope.start != "" && $scope.end != "") {
            angular.element('#sidebar input.start').val($scope.start);
            angular.element('#sidebar input.end').val($scope.end);
            $scope.mobilestart      = new Date(moment($filter('date')($scope.start, "yyyy-MM-dd")));
            $scope.mobileminstart   = moment().format("YYYY-MM-DD");

            $scope.mobileend        = new Date(moment($filter('date')($scope.end, "yyyy-MM-dd")));
            $scope.mobileminend     = moment().format("YYYY-MM-DD");

            $scope.times        = $rootScope.start_time_series($scope.start);
            $scope.endtimes     = $rootScope.start_time_series($scope.end,$scope.start,$scope.ct.checkInTime);
            $scope.changeTime();
        }
        else
        {
            $scope.start    =  moment().format('MMM DD, YYYY');
            $scope.end      =  moment().add(3, "days").format('MMM DD, YYYY');

            $scope.ct.checkInTime = "6:00 AM";
            $scope.ct.checkOutTime = "6:00 PM";

            $scope.mobilestart      = new Date(moment($scope.start));
            $scope.mobileminstart   = moment().format("YYYY-MM-DD");

            $scope.mobileend        = new Date(moment($scope.end));
            $scope.mobileminend     = moment().format("YYYY-MM-DD");

            angular.element('#sidebar input.start').val($scope.start);
            angular.element('#sidebar input.end').val($scope.end);

            $scope.times        = $rootScope.start_time_series($scope.start);
            $scope.endtimes     = $rootScope.start_time_series($scope.end,$scope.start,$scope.ct.checkInTime);
            $scope.changeTime();
        }
    }
    angular.element('#sidebar input.start').change(function(e) {
        angular.element('#sidebar input.start').datepicker('hide');
        e.preventDefault();
        angular.element('#sidebar input.start').blur();
        angular.element('#sidebar input.end').focus();
    });
    angular.element('#sidebar input.end').change(function(e) {
        e.preventDefault();
        angular.element('#sidebar input.end').blur();
        $timeout(function(){
            angular.element('#sidebar input.end').datepicker('hide');
            $scope.times            = $rootScope.start_time_series($scope.start);
            $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.ct.checkInTime);
            $scope.changeTime();
        },1000);
    });

    $scope.mobileDateChange = function(e){
        if(e=="start")
        {
            $scope.start = moment($scope.mobilestart).format('MMM DD, YYYY');
            //console.log($scope.start);

            if(moment($scope.start) > moment($scope.mobileend))
            {
                $scope.mobileend    = new Date($scope.start);
            }

            $scope.end              = moment($scope.mobileend).format('MMM DD, YYYY');

            $scope.mobileminend     = moment(new Date($scope.start)).format("YYYY-MM-DD");
        }
        else if(e=="end")
        {
            $scope.end = moment($scope.mobileend).format('MMM DD, YYYY');

            if(moment($scope.end) < moment($scope.start))
            {
                $scope.mobilestart          = new Date($scope.end);

                $scope.start                = moment($scope.mobilestart).format('MMM DD, YYYY');
                $scope.mobileminstart       = moment(new Date($scope.end)).format("YYYY-MM-DD");
            }

            $scope.times            = $rootScope.start_time_series($scope.start);
            $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.ct.checkInTime);
            $scope.changeTime();
        }
    }
}]);