app.controller('indexController', ['$scope', '$rootScope', '$timeout', '$http', 'toastr', '$cookieStore', 'airportService', '$filter', '$location','MetaService', function($scope, $rootScope, $timeout, $http, toastr, $cookieStore, airportService, $filter, $location,MetaService) {
    console.log("I'm in home controller test");
    $rootScope.headerClass = false;
    MetaService.setMeta('home');

    var cache = $rootScope.gp_userSearch;

    $scope.gclid = "";

    if(window.localStorage.getItem('gclid'))
    {
        $scope.gclid = "?gclid="+window.localStorage.getItem('gclid');
    }

    $scope.version_class = "";

    var version = $location.search().v;

    if(version==2)
    {
        $scope.version_class = "version_red";
    }
    
    //console.log('Cache::', cache);

    $scope.changeTime = function(){
        //console.log($scope.endtimes);
        if($scope.times.indexOf($scope.starttime) === -1) {
            $scope.starttime    = $scope.times[0];
        }

        if($scope.endtimes.length==0)
        {
            $scope.end          = moment($scope.start).add(1, "days").format("MMM DD, YYYY");
            $scope.mobileend    = new Date(moment($scope.start).add(1, "days"));

            angular.element('#datepicker input.end').val("");
            angular.element('#datepicker input.end').focus();

            $scope.times        = $rootScope.start_time_series($scope.start);
            $scope.endtimes     = $rootScope.start_time_series($scope.end,$scope.start,$scope.starttime);
            $scope.changeTime();
        }

        if($scope.endtimes.indexOf($scope.endtime) === -1) {
            $scope.endtime      = $scope.endtimes[0];
        }
    }

    if (typeof(cache)!="undefined")
    {
        if (cache.type == 'local') {
            $scope.airport = cache.airport_name;
            $scope.airport_top_banner_desc = cache.top_banner_desc;
        } else {
            $scope.airport = cache.airport_name + '(' + cache.airport_code + ')';
            $scope.airport_top_banner_desc = cache.top_banner_desc;
        }
        
        $scope.start            = cache.date_check_in;

        if(!$scope.start || (moment($scope.start) < moment(moment().format('MMM DD, YYYY'))))
        {
            $scope.start        = moment().format('MMM DD, YYYY');
        }

        //$scope.start            = moment().format('MMM DD, YYYY');
        $scope.mobilestart      = new Date(moment($scope.start));
        $scope.mobileminstart   = moment().format("YYYY-MM-DD");

        if(cache.time_check_in)
        {
            $scope.starttime        = cache.time_check_in;
            //$scope.mobilestarttime  = cache.time_check_in;
        }
        else
        {
            $scope.starttime        = "6:00 AM";
            //$scope.mobilestarttime  = "6:00 AM";
        }
        
        $scope.end                  = cache.date_check_out;

        if(!$scope.end)
        {
            $scope.end              = moment().add(3, "days").format('MMM DD, YYYY');
        }
        //$scope.end              = moment().add(3, "days").format('MMM DD, YYYY');
        $scope.mobileend            = new Date(moment($scope.end));

        $scope.mobileminend         = moment($scope.mobileminstart).format("YYYY-MM-DD");

        if(cache.time_check_out)
        {
            $scope.endtime          = cache.time_check_out;
        }
        else
        {
            $scope.endtime          = "6:00 PM";
        }

        $scope.times        = $rootScope.start_time_series($scope.start);
        $scope.endtimes     = $rootScope.start_time_series($scope.end,$scope.start,$scope.starttime);
        $scope.changeTime();
            
    }else{
        cache={};
        $scope.start            = moment().format('MMM DD, YYYY');
        $scope.mobilestart      = new Date(moment());
        $scope.mobileminstart   = moment().format("YYYY-MM-DD");
        $scope.starttime        = "6:00 AM";
        $scope.end              = moment().add(3, "days").format('MMM DD, YYYY');
        $scope.mobileend        = new Date(moment().add(3, "days"));
        $scope.mobileminend     = moment().format("YYYY-MM-DD");
        $scope.endtime          = "6:00 PM";
        $scope.times            = $rootScope.start_time_series($scope.start);
        $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.starttime);
        $scope.changeTime();
        //$scope.starttime        = $scope.times[0];
        //$scope.endtime          = $scope.endtimes[0];
    }
    if (typeof(cache.airport_background == 'undefined')) {
        $http.get($rootScope.API_URL+'/api/gp-settings/default_top_banner/').then(function(response) {
            console.log('Result file');
            //console.log(response.data);
            //console.log($rootScope.gp_userSearch['airport_background']);
            if(response.data.result.file!="")
            {
                $rootScope.gp_userSearch['airport_background'] = response.data.result.file;
            }
            else
            {
                $rootScope.gp_userSearch['airport_background'] = '/static/img/homepage/banner.jpg';
            }
            $scope.bannerText = response.data.result.value;
            $cookieStore.put('gp_userSearch', $rootScope.gp_userSearch);
            $scope.backgroundImage = "background: #4d536d url("+$rootScope.gp_userSearch['airport_background']+") no-repeat center top";
        });
    }
    $scope.airportList = [];

    $scope.mobileDateChange = function(e){
        if(e=="start")
        {
            $scope.start            = moment($scope.mobilestart).format('MMM DD, YYYY');

            if(moment($scope.start) > moment($scope.mobileend))
            {
                $scope.mobileend    = new Date($scope.start);
            }

            $scope.end              = moment($scope.mobileend).format('MMM DD, YYYY');

            /*$scope.times            = $rootScope.start_time_series($scope.start);
            $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.starttime);
            $scope.starttime        = $scope.times[0];
            $scope.endtime          = $scope.endtimes[0];*/

            $scope.mobileminend     = moment(new Date($scope.start)).format("YYYY-MM-DD");
        }
        else if(e=="end")
        {
            $scope.end                = moment($scope.mobileend).format('MMM DD, YYYY');

            if(moment($scope.end) < moment($scope.start))
            {
                $scope.mobilestart          = new Date($scope.end);

                $scope.start                = moment($scope.mobilestart).format('MMM DD, YYYY');
                $scope.mobileminstart       = moment(new Date($scope.end)).format("YYYY-MM-DD");
            }

            $scope.times            = $rootScope.start_time_series($scope.start);
            $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.starttime);
            $scope.changeTime();

        }
    }

    $scope.$watch("start", function() {
        $scope.times            = $rootScope.start_time_series($scope.start);
        $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.starttime);
        $scope.changeTime();
    });


    $scope.$watch("starttime", function() {
        $scope.times            = $rootScope.start_time_series($scope.start);
        $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.starttime);
        $scope.changeTime();
    });


    $scope.resetAirport = function(){
        $scope.airport = "";
    }

    $scope.notifyMe = function() {
        $http.post($rootScope.API_URL+'/api/airport-request/', { email: $scope.airportrequest_email, airport_name: $rootScope.noAirportName }).then(function(response) {
            toastr.success('Success!', 'Your airport request has been sent !');
        }, function(response) {
            toastr.success('Error', response.error);
        });
        $rootScope.noAirports = false;
    }
    angular.element('input.typeahead').on("change", function() {
        $rootScope.noAirports = false;
        $timeout(function() {
            for (airport in $scope.airportList) {
                var ap = $scope.airportList[airport];
                if ($scope.airport == ap.name + ' (' + ap.code + ')') {
                    $rootScope.noAirports = false;
                    $scope.airport_top_banner_desc = ap.top_banner_desc;
                    break;
                } else {
                    $rootScope.noAirports = true;
                    $rootScope.noAirportName = $scope.airport;
                    $timeout(function() {
                        $("#datepicker input.start").datepicker('hide');
                        angular.element('input.typeahead').focus();
                        angular.element('input.typeahead').click();
                    }, 200);
                }
            }
        }, 600);
    });


    airportService.getAirports(function(result) {
        $scope.airportList = result;
        $scope.chunckedAirport = chunk($scope.airportList, 3);
        var sources = airportService.getTypeAheadAirports();
        angular.element('.typeahead').typeahead({
            source: sources,
            autoSelect: true,
            afterSelect: function() {
                $timeout(function() {
                    angular.element('input.typeahead').blur();
                }, 200);
            }
        });
    });


    function chunk(arr, size) {
        var newArr = [];
        for (var i = 0; i < arr.length; i += size) {
            newArr.push(arr.slice(i, i + size));
        }
        return newArr;
    }
    // For read only fields
    angular.element('input[readonly]').each(function(index) {
        angular.element(this).addClass('used');
    });

    //For new datepicker
    $scope.minDate = new Date();
    angular.element('#datepicker.input-daterange').datepicker({
        startDate: $scope.minDate,
        format: "M dd, yyyy",
        orientation: "bottom left",
        todayHighlight: true
    }, applyCachValues());

    function applyCachValues() {
        console.log($scope.start);
        if ($scope.start != "" && $scope.end != "") {
            angular.element('#datepicker input.start').val($scope.start);
            angular.element('#datepicker input.end').val($scope.end);
        }
    }
    angular.element('#datepicker input.start').change(function(e) {
        $(this).datepicker('hide');
        e.preventDefault();
        angular.element('#datepicker input.start').blur();
        var new_min_date = angular.element('#datepicker input.start').val();
        
        angular.element('#datepicker input.end').val('');
        angular.element('#datepicker input.end').focus();
    });
    angular.element('#datepicker input.start').focus(function() {
        // angular.element('.label-change').text("Check-in date");
    });
    angular.element('#datepicker input.end').focus(function() {
        // angular.element('.label-change').text("Check-out date");
    });
    angular.element('#datepicker input.end').change(function(e) {
        $timeout(function(){
            angular.element('#datepicker input.end').datepicker('hide');
            e.preventDefault();
            angular.element('#datepicker input.end').blur();
            console.log("test");
            $scope.times            = $rootScope.start_time_series($scope.start);
            $scope.endtimes         = $rootScope.start_time_series($scope.end,$scope.start,$scope.starttime);
            //console.log($scope.endtimes);
            $scope.changeTime();
        },1000);
    });
}]);
