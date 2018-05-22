app.controller('appController', ['$scope', '$rootScope', '$http', '$cookies', '$cookieStore', '$timeout', '$location', 'ngMeta', function($scope, $rootScope, $http, $cookies, $cookieStore, $timeout, $location, ngMeta) {
    console.log('app controller');

    // $rootScope.metaservice = MetaService;
    // $rootScope.metaservice.set('gotparking', 'gotparking reservation system', '');

     $rootScope.resetSession = function(){
        $http.defaults.headers.common['Authorization'] = '';
        $rootScope.gp_loggedIn = false;
        $rootScope.gp_userId = false;
        $rootScope.gp_userToken = '';
        $cookieStore.put('gp_loggedIn', $rootScope.gp_loggedIn);
        $cookieStore.put('gp_userId', $rootScope.gp_userId);
        $cookieStore.put('gp_userToken', $rootScope.gp_userToken);
    }

    //$cookieStore.remove('gp_userSearch');

   /// Cookies 
    $rootScope.gp_userSearch = $cookieStore.get('gp_userSearch');
    $rootScope.gp_userToken = $cookieStore.get('gp_userToken');
    $rootScope.gp_loggedIn = $cookieStore.get('gp_loggedIn');
    $rootScope.gp_userId = $cookieStore.get('gp_userId');


    //alert(gp_userToken)
    if(typeof($rootScope.gp_loggedIn) === 'undefined'){
        $rootScope.resetSession()

    }else{

        //console.log('Token : ' + $rootScope.gp_userToken);
        $http.defaults.headers.common['Authorization'] = 'JWT ' + $rootScope.gp_userToken;

        $http.get($rootScope.API_URL+'/api/authenticate/').then(function(response){
                //console.log("In 1");
                var success = response.data.success;
                if (success === true){
                    
                    $rootScope.gp_loggedIn = true;
                    $rootScope.gp_userId = response.data.result.id;
                    $cookieStore.put('gp_loggedIn', $rootScope.gp_loggedIn);
                    $cookieStore.put('gp_userId', $rootScope.gp_userId);

                    //console.log("In 2");
                    if (typeof($rootScope.gp_userSearch.airport_name) === 'undefined'){
                        //console.log("In 3");
                        $http.get($rootScope.API_URL+"/api/user-search/"+gp_userId ).then(function (response) {
                            //console.log("In 4");
                            $rootScope.gp_userSearch = response.data.user_search;
                            $rootScope.gp_userSearch['type'] = 'remote';
                            //console.log(gp_userSearch)
                            //console.log($rootScope.gp_userSearch);
                            $cookieStore.put('gp_userSearch', rootScope.gp_userSearch);
                        });
                    }

                }else{
                    //alert('no user')
                }
        });

    }

    //alert(gp_userSearch.airport_name)
    try{
        //console.log("In 5");
        var airport_name = $rootScope.gp_userSearch.airport_name;
    }catch(err){
        //console.log("In 6");
        var gp_userSearch = {'airport_name':'', 'airport_code':'', 'date_check_in':'','time_check_in':'', 'date_check_out':'','time_check_out':'', 'type':'local', 'airport_background':''}
        $http.get($rootScope.API_URL+'/api/gp-settings/airport_default_background/').then(function(response){
            //console.log("In 7");
            try{
                if(response.data.result.file!="")
                {
                    gp_userSearch['airport_background'] = response.data.result.file;
                }
                else
                {
                    gp_userSearch['airport_background'] = '/static/img/homepage/banner.jpg';
                }
                
            }catch(err){
                gp_userSearch['airport_background'] = '/static/img/homepage/banner.jpg';
            }
            //console.log("In 8");
            //console.log(gp_userSearch['airport_background']);
            $rootScope.gp_userSearch = gp_userSearch;
            $cookieStore.put('gp_userSearch', $rootScope.gp_userSearch);
        });
    }

    $rootScope.start_time_series = function(slectedDate,selectedStartdDate,slectedTime) {
        var dt = new Date(1970, 0, 1, 0, 0, 0, 0);
        var times = [];

        var current_time    = moment().format("HH:mm");

        //console.log(slectedDate);

        //console.log(slectedTime);

        if(slectedTime)
        {
            current_time = moment(slectedTime, ["h:mm A"]).format("HH:mm");
        }

        var today           = moment(moment().format('MMM DD, YYYY'));

        if(selectedStartdDate)
        {
            today  = moment(selectedStartdDate);
        }

        while (dt.getDate() == 1) {
            var point = dt.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
            var point24 = moment(point, ["h:mm A"]).format("HH:mm");

            dt.setMinutes(dt.getMinutes() + 30);

            if((point24 > current_time) || ( moment(slectedDate) > today))
            {
                times.push(point);
            }
        }

        return times;
    }
   

    $rootScope.signout = function(){
        if($rootScope.gp_loggedIn === true){
            $rootScope.resetSession();
            // alert("You've been successfully signed out")
            $location.path("/");
        }
    }

}]);

