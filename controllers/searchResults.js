app.controller('searchResults', ['$scope', '$timeout', '$rootScope', '$location', '$routeParams', '$http', 'parkingLotService', '$cookies', '$cookieStore', '$filter', function($scope, $timeout, $rootScope, $location, $routeParams, $http, parkingLotService, $cookies, $cookieStore, $filter) {
    console.log("I'm in Search controller");
    $rootScope.headerClass = false;
    $rootScope.headerClassSearchPage = true;
    $('input.date-pick').datepicker('setDate', 'today');
    (function(A) {
        if (!Array.prototype.forEach)
            A.forEach = A.forEach || function(action, that) {
                for (var i = 0, l = this.length; i < l; i++)
                    if (i in this)
                        action.call(that, this[i], i, this);
            };

    })(Array.prototype);

    $scope.airport = $routeParams.airport;
    $scope.slectedAirport = $routeParams.airport;
    //$cookieStore.put('airport', $scope.airport);
    $scope.start        = $routeParams.start;
    $scope.end          = $routeParams.end;
    $scope.startTime    = $routeParams.startTime;
    $scope.endTime      = $routeParams.endTime;

    $scope.gclid    = "";

    $scope.changeTime = function(){
        //console.log($scope.endtimes);
        if($scope.times.indexOf($scope.st.checkInTime) === -1) {
            $scope.st.checkInTime    = $scope.times[0];
        }

        if($scope.endtimes.length==0)
        {
            $scope.end          = moment($scope.start).add(1, "days").format("MMM DD, YYYY");
            $scope.mobi_end     = new Date(moment($scope.start).add(1, "days"));

            angular.element('#tools input.end').val("");
            angular.element('#tools input.end').focus();

            $scope.times        = $rootScope.start_time_series($scope.start);
            $scope.endtimes     = $rootScope.start_time_series($scope.end,$scope.start,$scope.st.checkInTime);
            $scope.changeTime();
        }

        if($scope.endtimes.indexOf($scope.st.checkOutTime) === -1) {
            $scope.st.checkOutTime      = $scope.endtimes[0];
        }
    }

    if(window.localStorage.getItem('gclid'))
    {
        $scope.gclid = "?gclid="+window.localStorage.getItem('gclid');
    }

    $scope.mobi_start       = new Date(moment($routeParams.start));
    $scope.mobileminstart   = moment().format("YYYY-MM-DD");
    $scope.mobi_end         = new Date(moment($routeParams.end));
    $scope.mobileminend     = moment($scope.mobileminstart).format("YYYY-MM-DD");

    $scope.mobileDateChange = function(e){
        if(e=="start")
        {
            $scope.start = moment($scope.mobi_start).format('MMM DD, YYYY');
            //console.log($scope.start);

            if(moment($scope.start) > moment($scope.mobi_end))
            {
                $scope.mobi_end    = new Date($scope.start);
            }

            $scope.end              = moment($scope.mobi_end).format('MMM DD, YYYY');
        }
        else if(e=="end")
        {
            $scope.end = moment($scope.mobi_end).format('MMM DD, YYYY');

            if(moment($scope.end) < moment($scope.start))
            {
                $scope.mobi_start          = new Date($scope.end);

                $scope.start                = moment($scope.mobi_start).format('MMM DD, YYYY');
                $scope.mobileminstart       = moment(new Date($scope.end)).format("YYYY-MM-DD");
            }

            $scope.times            = $rootScope.start_time_series($scope.start);
            $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.st.checkInTime);
            $scope.changeTime();
        }
    }

    parkingLotService.setValue('start', $scope.start);
    parkingLotService.setValue('end', $scope.end);

    $scope.backgroundImage = $cookieStore.get('backgroundImage');

    if (typeof($scope.backgroundImage) === 'undefined') {
        $scope.backgroundImage = '../img/homepage/banner.jpg';
    }

    function chunk(arr, size) {
        var newArr = [];
        for (var i = 0; i < arr.length; i += size) {
            newArr.push(arr.slice(i, i + size));
        }
        return newArr;
    }
    // For getting Airports list for typeahead
    $scope.airportList = [];

    $http.post($rootScope.API_URL + "/api/get-airport-list/").then(function(response) {
        $scope.airportList = response.data.result;
        $scope.chunckedAirport = chunk($scope.airportList, 3);

        var source = [];
        for (i = 0; i < $scope.airportList.length; i++) {
            var airport = $scope.airportList[i];
            var obj = { id: airport.id, name: airport.name + ' (' + airport.code + ')', code: airport.code };
            source.push(obj)
        }
        $('.typeahead').typeahead({
            source: source,
            autoSelect: true,
            showHintOnFocus: true,
            afterSelect: function(slctd) {
                $timeout(function() {
                    angular.element('input.typeahead').blur();
                    $scope.dAirport = slctd.code;
                    $scope.airport = slctd.name;
                }, 500);
            }
        });


    });



    $scope.start2 = $routeParams.start;
    $scope.end2 = $routeParams.end;

    $scope.selectedParkingLot = false;
    $scope.results = []

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

    $scope.st = {};
    
    if($scope.startTime)
    {
        $scope.st.checkInTime = $scope.startTime;
    }
    else
    {
        $scope.st.checkInTime = "6:00 AM";
    }
    if($scope.endTime)
    {
        $scope.st.checkOutTime = $scope.endTime;
    }
    else{
        $scope.st.checkOutTime = "6:00 PM";
    }

    $scope.$watch("start", function() {
        $scope.times            = $rootScope.start_time_series($scope.start);
        $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.st.checkInTime);
        $scope.changeTime();
    });

    $scope.$watch("end", function() {
        console.log("End Updated");
        //$scope.times            = $rootScope.start_time_series($scope.start);
        //$scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.st.checkInTime);
        //$scope.changeTime();
    });

    $scope.$watch("st.checkInTime", function() {
        $scope.times            = $rootScope.start_time_series($scope.start);
        $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.st.checkInTime);
        $scope.changeTime();
    });


    $http.post($rootScope.API_URL + "/api/search/", { 'airport': $scope.airport, 'date_check_in': $scope.start2+' '+$scope.st.checkInTime, 'date_check_out': $scope.end2+' '+$scope.st.checkOutTime, 'user_id': $rootScope.gp_userId }).then(function(response) {
        //console.log("test");
        //console.log(response);
        if (typeof(response.data.results) == 'undefined' || typeof(response.data.results.parking_lots) == 'undefined') {
            $rootScope.noAirports = true;
            $rootScope.noAirportName = $scope.airport;
            $timeout(function() {
                $location.path("/");
            }, 200);
        }
        $scope.markersData.airport = response.data.results.airport_info[0];
        $scope.dAirport = response.data.results.airport_info[0].code;
        //$cookieStore.put('backgroundImage', $scope.markersData.airport.image);
        var airport_name = $scope.airport;
        var gp_userSearch = $rootScope.gp_userSearch;
        try {
            response.data.user_search['type'] = 'remote';
            //$rootScope.gp_userSearch = response.data.user_search;
            //console.log("asdasd");
            //console.log($rootScope.gp_userSearch);
            $scope.backgroundImage = $rootScope.gp_userSearch.airport_background;
            $rootScope.gp_userSearch = { 'airport_name': $scope.airport, 'date_check_in': $scope.start, 'time_check_in': $scope.st.checkInTime, 'date_check_out': $scope.end, 'time_check_out': $scope.st.checkOutTime, 'airport_background': '/media/' + $scope.markersData.airport.image, 'type': 'local' }

        } catch (err) {
            $rootScope.gp_userSearch = { 'airport_name': $scope.airport, 'date_check_in': $scope.start, 'time_check_in': $scope.st.checkInTime, 'date_check_out': $scope.end, 'time_check_out': $scope.st.checkOutTime, 'airport_background': '/media/' + $scope.markersData.airport.image, 'type': 'local' }

        }
        $cookieStore.put('gp_userSearch', $rootScope.gp_userSearch);


        var haveData = false;
        try {
            var total = response.data.results.parking_lots.length;
            haveData = true;
            for (var i = 0; i < total; i++) {
                var parkinglot = response.data.results.parking_lots[i];
                parkinglot.label = parseFloat(parkinglot.daily_rate).toFixed(2).toString()
                parkinglot.key = i;
                $scope.markersData.ParkingLots.push(parkinglot);
                //console.log(response.data.results.parking_lots[i]);
            }
        } catch (err) {

        }
        console.log('airport', $scope.markersData)

        if (haveData === true) {

            if($scope.markersData.ParkingLots[0])
            {
                 mapOptions['center'] = new google.maps.LatLng($scope.markersData.ParkingLots[0]['location_latitude'], $scope.markersData.ParkingLots[0]['location_longitude']);
            }
           

            $timeout(function() {
                mapObject = new google.maps.Map(document.getElementById('map'), mapOptions);
                var bounds = new google.maps.LatLngBounds();
                var marker;
                //for (var key in $scope.markersData)
                var key = 'ParkingLots';
                console.log($scope.markersData);
                $scope.markersData[key].forEach(function(item) {
                    var loc = new google.maps.LatLng(item.location_latitude, item.location_longitude)
                    marker = new google.maps.Marker({
                        position: loc,
                        map: mapObject,
                        icon: 'img/pins/pink_icon.png',
                        label: {
                            text: '$' + parseInt(item.label),
                            color: 'white',
                            fontWeight: 'bold'
                        }
                    });
                    bounds.extend(loc);
                    if ('undefined' === typeof markers[key])
                        markers[key] = [];
                    markers[key].push(marker);
                    google.maps.event.addListener(marker, 'click', (function() {
                        closeInfoBox();
                        getInfoBox(item, this).open(mapObject, this);
                        mapObject.setCenter(new google.maps.LatLng(item.location_latitude, item.location_longitude));
                    }));
                });

                var airportLoc = new google.maps.LatLng($scope.markersData.airport.latitude, $scope.markersData.airport.longitude);
                bounds.extend(airportLoc);
                marker = new google.maps.Marker({
                    position: airportLoc,
                    map: mapObject,
                    icon: 'img/pins/airport.png'
                });
                if(markers[key])
                {
                    markers[key].push(marker);
                }
                console.log("one marker", marker);
                console.log("markers", marker);
                mapObject.fitBounds(bounds); // auto-zoom
                mapObject.panToBounds(bounds); // auto-center

            }, 100);
        }

    });




    $scope.hideAllMarkers = function() {
        for (var key in markers)
            markers[key].forEach(function(marker) {
                marker.setMap(null);
            });
    };

    $scope.toggleMarkers = function(category) {
        hideAllMarkers();
        closeInfoBox();

        if ('undefined' === typeof markers[category])
            return false;
        markers[category].forEach(function(marker) {
            marker.setMap(mapObject);
            marker.setAnimation(google.maps.Animation.DROP);

        });
    };

    var closeInfoBox = function() {
        $('div.infoBox').remove();
    };

    var getInfoBox = function(item, eleme) {
        angular.element('.hotel_container').removeClass('active');
        angular.element('#loc' + item.key).addClass('active');
        var target = $('.hotel_container.active');
        $('.content-left').animate({
            scrollTop: target.offset().top - 100
        }, 500);
        // Reseting the icon to pink
        for (var key in markers)
            markers[key].forEach(function(marker) {
                if(marker.getLabel())
                {
                    marker.setIcon('img/pins/pink_icon.png');
                }
            });

        eleme.setIcon('img/pins/blue_icon.png');

        return new InfoBox({
            disableAutoPan: false,
            maxWidth: 0,
            pixelOffset: new google.maps.Size(10, 125),
            closeBoxMargin: '5px -20px 2px 2px',
            closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
            isHidden: false,
            alignBottom: true,
            pane: 'floatPane',
            enableEventPropagation: true
        });
    };

    $scope.onHtmlClick = function(location_type, key) {
        google.maps.event.trigger(markers[location_type][key], "click");
        markers[location_type][key].setIcon('img/pins/blue_icon.png');
    }

    $scope.onHover = function(location_type, key) {
        // google.maps.event.trigger(markers[location_type][key], "click");
        try {
            markers[location_type][key].setIcon('img/pins/blue_icon.png');
        } catch (err) {

        }
    }

    $scope.onLeave = function(location_type, key) {
        // google.maps.event.trigger(markers[location_type][key], "click");
        markers[location_type][key].setIcon('img/pins/pink_icon.png');
    }



    function sortByKey(array, key, desc) {
        return array.sort(function(a, b) {
            var x = a[key];
            var y = b[key];
            if (desc === false) {
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            } else {
                return ((x > y) ? -1 : ((x < y) ? 1 : 0));
            }
        });
    }
    $scope.sort = "popular";
    $scope.sortByFilter = function(option) {
        $scope.sort = option;
        var desc = false;
        // if (option == 'popular'){
        //     desc = true;
        // }
        var sortedParkingLots = [];
        var keys = { popular: 'popular_order', cheapest: 'daily_rate', closest: 'distance' }

        sortByKey($scope.markersData['ParkingLots'], keys[option], desc);
    }


    $scope.getRatingsArray = function(rating) {
        var arr = getRatings(rating);
        return arr;
    }


    $scope.parkHereBtn = function(parkinglot) {
        $scope.selectedParkingLot = parkinglot.id;
        parkingLotService.setValue('parkingLot', parkinglot);
        parkingLotService.setValue('airport', $scope.airport);
        parkingLotService.setValue('id', $scope.selectedParkingLot);
        parkingLotService.setValue('start', $scope.start2);
        parkingLotService.setValue('end', $scope.end2);
        parkingLotService.setValue('checkInTime', $scope.st.checkInTime);
        parkingLotService.setValue('checkOutTime', $scope.st.checkOutTime);

        // Analytics code
        dataLayer.push({
            'event': 'productclick',
            'ecommerce': {
                'click': {
                    'actionField': { 'list': $scope.airport },
                    'products': [{
                        'name': parkingLotService.getValue().parkingLot.name,
                        'id': parkingLotService.getValue().parkingLot.id,
                        'category': 'reservation'
                    }]
                }
            }
        });
        console.log('Ariport name : ' + $scope.airport + 'id : ' + parkingLotService.getValue().parkingLot.id + ' name : ' + parkingLotService.getValue().parkingLot.name);

        //angular.element('#search-timings').modal('toggle');
        $timeout(function() {
            $location.path("/checkout");
        }, 300);
    }
    
    //For new datepicker
    $scope.minDate = new Date();
    $('#tools .input-daterange').datepicker({
        startDate: $scope.minDate,
        format: "M dd, yyyy",
        todayHighlight: true
    }, applyExistingValues());
    // Apply the existing values so that start date don't change when we change end date
    function applyExistingValues() {
        console.log("existing values");
        if ($scope.start != "" && $scope.end != "") {
            angular.element('#tools input.start').val($scope.start);
            angular.element('#tools input.end').val($scope.end);
        }
    }

    angular.element('#tools input.start').change(function(e) {
        angular.element('#tools input.start').datepicker('hide');
        e.preventDefault();
        angular.element('#tools input.start').blur();
        angular.element('#tools input.end').focus();
        $scope.times            = $rootScope.start_time_series($scope.start);
        $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.st.checkInTime);
        $scope.changeTime();
    });

    angular.element('#tools input.end').change(function(e) {
        console.log("Updated");
        console.log($scope.end);
        $timeout(function(){
            console.log(angular.element('#tools input.end').val());
            console.log("hide datepicker");
            angular.element('#tools input.end').datepicker('hide');
            $scope.times            = $rootScope.start_time_series($scope.start);
            $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.st.checkInTime);
            $scope.changeTime();
        },1000);
    });
}]);