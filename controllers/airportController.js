app.controller('airportController', ['$scope', '$rootScope', '$routeParams', 'airportService', '$location', '$filter', 'ngMeta', 'parkingLotService', '$timeout','$http','toastr', function($scope, $rootScope, $routeParams, airportService, $location, $filter, ngMeta, parkingLotService, $timeout, $http, toastr) {
    console.log("I'm in airport controller!!");

    console.log('Sluggg:::' + $routeParams.slug);

    $scope.gclid = "";

    if(window.localStorage.getItem('gclid'))
    {
        $scope.gclid = "?gclid="+window.localStorage.getItem('gclid');
    }

    var cache = $rootScope.gp_userSearch;

    //console.log(cache);

    $scope.version_class = "";

    $scope.version = $location.search().v;

    if($scope.version==2)
    {
        $scope.version_class = "version_red";
    }

    $scope.top_parkinglots = [];

    airportService.getAirportDetail($routeParams.slug, function(result) {
        if (result.status == 200) {
            $scope.airport = result.data;
            console.log('Airports here ~~~~~~~');
            //console.log($scope.airport);

            if($scope.version == 3)
            { 
                $scope.airport.version_text  = "Long Term Parking";
                ngMeta.setTitle($scope.airport.name + " Long Term Parking - Search, Compare, Reserve.");
            }
            else if($scope.version == 4)
            {
                $scope.airport.version_text  = "Short Term Parking";
                ngMeta.setTitle($scope.airport.name + " Short Term Parking - Search, Compare, Reserve.");
            }
            else
            {
                $scope.airport.version_text  = "";
                ngMeta.setTitle($scope.airport.name);
            }

            ngMeta.setTag('description', $scope.airport.meta_description);

            $scope.selectedAirport = $scope.airport.name + ' (' + $scope.airport.code + ')';

            var haveData = false;

            //background-image:url('/static/img/homepage/bur.jpg');
            airportService.getTopParkingLots($routeParams.slug, function(parkinglots) {
                console.log(parkinglots);
                if(parkinglots.status==200)
                {
                    //$scope.top_parkinglots = parkinglots;
                    parkinglots.data.results.forEach(function(item) {
                        console.log("123");
                        haveData = true;
                        $scope.top_parkinglots.push(item);
                    });
                    //sconsole.log($scope.top_parkinglots);

                    if(haveData)
                    {
                        $scope.addMap();
                    }
                }
                else
                {
                    console.log("error");
                }
            });

        } else {
            $location.path('/')
        }
    });

    $scope.addMap = function(){
        $scope.markersData = { 'ParkingLots': [] }
        $scope.mapObject,
            markers = [];

        var mapOptions = {
            // zoom: 10,
            //center: new google.maps.LatLng(48.865633, 2.321236),
            mapTypeId: google.maps.MapTypeId.ROADMAP,

            mapTypeControl: false,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                position: google.maps.ControlPosition.LEFT_CENTER
            },
            panControl: false,
            panControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
            },
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.RIGHT_BOTTOM
            },
            scrollwheel: false,
            scaleControl: false,
            scaleControlOptions: {
                position: google.maps.ControlPosition.LEFT_CENTER
            },
            streetViewControl: true,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.RIGHT_BOTTOM
            },
            styles: [{
                "featureType": "landscape",
                "stylers": [{
                    "hue": "#FFBB00"
                }, {
                    "saturation": 43.400000000000006
                }, {
                    "lightness": 37.599999999999994
                }, {
                    "gamma": 1
                }]
            }, {
                "featureType": "road.highway",
                "stylers": [{
                    "hue": "#FFC200"
                }, {
                    "saturation": -61.8
                }, {
                    "lightness": 45.599999999999994
                }, {
                    "gamma": 1
                }]
            }, {
                "featureType": "road.arterial",
                "stylers": [{
                    "hue": "#FF0300"
                }, {
                    "saturation": -100
                }, {
                    "lightness": 51.19999999999999
                }, {
                    "gamma": 1
                }]
            }, {
                "featureType": "road.local",
                "stylers": [{
                    "hue": "#FF0300"
                }, {
                    "saturation": -100
                }, {
                    "lightness": 52
                }, {
                    "gamma": 1
                }]
            }, {
                "featureType": "water",
                "stylers": [{
                    "hue": "#0078FF"
                }, {
                    "saturation": -13.200000000000003
                }, {
                    "lightness": 2.4000000000000057
                }, {
                    "gamma": 1
                }]
            }, {
                "featureType": "poi",
                "stylers": [{
                    "hue": "#00FF6A"
                }, {
                    "saturation": -1.0989010989011234
                }, {
                    "lightness": 11.200000000000017
                }, {
                    "gamma": 1
                }]
            }]
        };

        mapOptions['center'] = new google.maps.LatLng($scope.airport.parking_lots[0]['location_latitude'], $scope.airport.parking_lots[0]['location_longitude']);

        $timeout(function() {
            mapObject = new google.maps.Map(document.getElementById('map'), mapOptions);
            var bounds = new google.maps.LatLngBounds();
            var marker;
            //for (var key in $scope.markersData)
            var key = 'ParkingLots';
            
            $scope.top_parkinglots.forEach(function(item) {
                //console.log('in123');
                //console.log(item);
                item.label = parseFloat(item.daily_rate).toFixed(2).toString();
                var loc = new google.maps.LatLng(item.location_latitude, item.location_longitude)
                marker = new google.maps.Marker({
                    position: loc,
                    map: mapObject,
                    icon: 'img/pins/pink_icon.png',
                    /*label: {
                        text: '$' + parseInt(item.label),
                        color: 'white',
                        fontWeight: 'bold'
                    }*/
                });
                bounds.extend(loc);
                //if ('undefined' === typeof markers[key])
                  //  markers[key] = [];
                //markers[key].push(marker);

            });

            var airportLoc = new google.maps.LatLng($scope.airport.latitude, $scope.airport.longitude);
            bounds.extend(airportLoc);
            marker = new google.maps.Marker({
                position: airportLoc,
                map: mapObject,
                icon: 'img/pins/airport.png'
            });

            //markers[key].push(marker);
            //console.log("one marker", marker);
            //console.log("markers", marker);
            mapObject.fitBounds(bounds); // auto-zoom
            mapObject.panToBounds(bounds); // auto-center

        }, 100);
    }

    $scope.changeTime = function(){
        //console.log($scope.endtimes);
        if($scope.times.indexOf($scope.st.checkInTime) === -1) {
            $scope.st.checkInTime    = $scope.times[0];
        }

        if($scope.endtimes.length==0)
        {
            $scope.end          = moment($scope.start).add(1, "days").format("MMM DD, YYYY");
            $scope.mobileend    = new Date(moment($scope.start).add(1, "days"));

            angular.element('input.end').val();
            angular.element('input.end').focus();

            $scope.times            = $rootScope.start_time_series($scope.start);
            $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.st.checkInTime);
            $scope.changeTime();
        }

        if($scope.endtimes.indexOf($scope.st.checkOutTime) === -1) {
            $scope.st.checkOutTime      = $scope.endtimes[0];
        }
    }

    $scope.parkHereBtn = function(parkinglot) {
        $scope.selectedParkingLot = parkinglot;
        parkingLotService.setValue('parkingLot', parkinglot);
        parkingLotService.setValue('airport', $scope.selectedAirport);
    }

    $scope.closeModal = function() {
            parkingLotService.setValue('id', $scope.selectedParkingLot.id);
            parkingLotService.setValue('start', $scope.start);
            parkingLotService.setValue('end', $scope.end);
            parkingLotService.setValue('checkInTime', $scope.st.checkInTime);
            parkingLotService.setValue('checkOutTime', $scope.st.checkOutTime);

            $http.get($rootScope.API_URL + "/api/parkinglot/"+$scope.selectedParkingLot.code.toLowerCase()+"/blackout?date_check_in="+moment($scope.start).format('YYYY-MM-DD')+"&date_check_out="+moment($scope.end).format('YYYY-MM-DD')).then(function(response) {
                if(!response.data.is_blackout)
                {
                    angular.element('#final-timings').modal('toggle');
                    // Analytics code
                    dataLayer.push({
                        'event': 'addtocart',
                        'ecommerce': {
                            'add': {
                                'products': [{
                                    'name': parkingLotService.getValue().parkingLot.name,
                                    'id': parkingLotService.getValue().parkingLot.id,
                                    'category': 'reservation'
                                }]
                            }
                        }
                    });
                    console.log('id : ' + parkingLotService.getValue().parkingLot.id + ' name : ' + parkingLotService.getValue().parkingLot.name);
                    $timeout(function() {
                        $location.path("/checkout");
                    }, 300);
                }
                else
                {
                    toastr.error('Error!', "Parking lot is not available for selected date range.");
                }
            });
    }

    $scope.st = {};

    if (typeof(cache)!="undefined")
    {
        $scope.start            = cache.date_check_in;

        if(!$scope.start || (moment($scope.start) < moment(moment().format('MMM DD, YYYY'))))
        {
            $scope.start            = moment().format('MMM DD, YYYY');
        }
        //$scope.start            = moment().format('MMM DD, YYYY');
        $scope.mobilestart      = new Date(moment($scope.start));
        $scope.mobileminstart   = moment($scope.start).format("YYYY-MM-DD");

        if(cache.time_check_in)
        {
            $scope.st.checkInTime   = cache.time_check_in;
        }
        else
        {
            $scope.st.checkInTime   = "6:00 AM";
        }
        
        $scope.end                  = cache.date_check_out;

        if(!$scope.end)
        {
            $scope.end              = moment().add(3, "days").format('MMM DD, YYYY');
        }
        //$scope.end              = moment().add(3, "days").format('MMM DD, YYYY');
        $scope.mobileend            = new Date(moment($scope.end));
        $scope.mobileminend         = moment($scope.start).format("YYYY-MM-DD");

        if(cache.time_check_out)
        {
            $scope.st.checkOutTime  = cache.time_check_out;
        }
        else
        {
            $scope.st.checkOutTime   = "6:00 PM";
        } 

        $scope.times            = $rootScope.start_time_series($scope.start);
        $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.st.checkInTime);
        $scope.changeTime();
    }

    else
    {
        $scope.st.checkInTime   = "6:00 AM";
        $scope.st.checkOutTime  = "6:00 PM";

        //$scope.start    =  $filter('date')(Date.now(), 'MMM dd, yyyy');
        //$scope.end      =  $filter('date')(Date.now() + 3 * (24 * 60 * 60 * 1000), 'MMM dd, yyyy');

        $scope.start            = moment().format('MMM DD, YYYY');
        $scope.mobilestart      = new Date(moment());
        $scope.mobileminstart   = moment().format("YYYY-MM-DD");

        $scope.end              = moment().add(3, "days").format('MMM DD, YYYY');
        $scope.mobileend        = new Date(moment().add(3, "days"));
        $scope.mobileminend     = moment().format("YYYY-MM-DD");

        $scope.times            = $rootScope.start_time_series($scope.start);
        $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.st.checkInTime);
        $scope.changeTime();
    }

    $rootScope.headerClass = false;
    var $input = $('.typeahead');

    airportService.getAirports(function(result) {
        $scope.airports = result;
        $scope.sources = airportService.getTypeAheadAirports();
        $input.typeahead({
            source: $scope.sources,
            autoSelect: true
        });
    });

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
            $scope.endtimes     = $rootScope.start_time_series($scope.end,$scope.start,$scope.st.checkInTime);
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
            $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.st.checkInTime);
            $scope.changeTime();
        }, 1000);
    });


    $scope.mobileDateChange = function(e){
        if(e=="start")
        {
            $scope.start            = moment($scope.mobilestart).format('MMM DD, YYYY');

            if(moment($scope.start) > moment($scope.mobileend))
            {
                $scope.mobileend    = new Date($scope.start);
            }

            $scope.end              = moment($scope.mobileend).format('MMM DD, YYYY');

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
            $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.st.checkInTime);
            $scope.changeTime();
        }
    }

    $scope.resetAirport = function(){
        $scope.selectedAirport = "";
    }

    $scope.$watch("start", function() {
        $scope.times            = $rootScope.start_time_series($scope.start);
        $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.st.checkInTime);
        $scope.changeTime();
    });

    $scope.$watch("end", function() {
        //console.log("End Updated");
        //$scope.times            = $rootScope.start_time_series($scope.start);
        //$scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.st.checkInTime);
        //$scope.changeTime();
    });

    $scope.$watch("st.checkInTime", function() {
        //console.log("checging time");
        $scope.times            = $rootScope.start_time_series($scope.start);
        $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.st.checkInTime);
        $scope.changeTime();
    });

    // For read only fields
    angular.element('input[readonly]').each(function(index) {
        angular.element(this).addClass('used');
    });

    //For new datepicker
    $scope.minDate = new Date();
    
    angular.element('.input-daterange').datepicker({
        startDate: $scope.minDate,
        format: "M dd, yyyy",
        orientation: "bottom auto",
        todayHighlight: true
    });
    angular.element('input.start').change(function(e) {
        $(this).datepicker('hide');
        e.preventDefault();
        angular.element('input.start').blur();
        angular.element('input.end').focus();
    });
    angular.element(' input.start').focus(function() {
        // angular.element('.label-change').text("Check-in date");
    });
    angular.element(' input.end').focus(function() {
        // angular.element('.label-change').text("Check-out date");
    });
    angular.element(' input.end').change(function(e) {
        $(this).datepicker('hide');
        e.preventDefault();
        angular.element('input.end').blur();
        $timeout(function(){
            $scope.times            = $rootScope.start_time_series($scope.start);
            $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.st.checkInTime);
            $scope.changeTime();
        },1000);
    });
}]);