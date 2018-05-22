app.controller('cityController', ['$scope', '$rootScope', function($scope,$rootScope) {
    console.log("I'm in home controller");
    $rootScope.headerClass= false;
    var $input = $('.typeahead');
    $input.typeahead({
        source: [
            {
                id: "0",
                name: "All Airports"
            }, {
                id: "1",
                name: "Albany (ALB)"
            }, {
                id: "2",
                name: "Albuquerque (ABQ)"
            }, {
                id: "3",
                name: "Anchorage (ANC)"
            }, {
                id: "4",
                name: "Atlanta (ATL)"
            }, {
                id: "5",
                name: "City International Airport (ACY)"
            }, {
                id: "6",
                name: "Austin (AUS)"
            }, {
                id: "7",
                name: "Baltimore (BWI)"
            }, {
                id: "8",
                name: "Baton Rouge (BTR)"
            }, {
                id: "9",
                name: "Birmingham (BHM)"
            }, {
                id: "10",
                name: "Boise (BOI)"
            }, {
                id: "11",
                name: "Boston (BOS)"
            }, {
                id: "12",
                name: "Buffalo (BUF)"
            }, {
                id: "13",
                name: "Burbank (BUR)"
            }, {
                id: "14",
                name: "Burlington (BTV)"
            }, {
                id: "15",
                name: "Charleston (CHS)"
            }, {
                id: "16",
                name: "Charleston (WV) (CRW)"
            }, {
                id: "17",
                name: "Charlotte (CLT)"
            }, {
                id: "18",
                name: "Chattanooga (CHA)"
            }, {
                id: "19",
                name: "Chicago Midway (MDW)"
            }, {
                id: "20",
                name: "Chicago OHare (ORD)"
            }, {
                id: "21",
                name: "Cincinnati (CVG)"
            }, {
                id: "22",
                name: "Cleveland (CLE)"
            }, {
                id: "23",
                name: "College Station (CLL)"
            }, {
                id: "24",
                name: "Colorado Springs (COS)"
            }, {
                id: "25",
                name: "Columbia Metropolitan (CAE)"
            }, {
                id: "26",
                name: "Columbus (CMH)"
            }, {
                id: "27",
                name: "Dallas (DFW)"
            }, {
                id: "28",
                name: "Dallas-Love Field (DAL)"
            }
        ],
        autoSelect: true
    });

    // For read only fields
    angular.element('input[readonly]').each(function(index) {
        angular.element(this).addClass('used');
    });
    // For new datepicker
    var starttDate= moment().add(1, "days");
    var enddDate= moment().add(3, "days");

    //For new datepicker
    $scope.minDate = new Date();
    angular.element('#datepicker.input-daterange').datepicker({
        startDate: $scope.minDate,
        format: "M dd, yyyy",
        orientation: "bottom auto",
        todayHighlight: true
    });
    angular.element('#datepicker input.start').change(function(e){
        $(this).datepicker('hide');
        e.preventDefault();
        angular.element('#datepicker input.start').blur();
        angular.element('#datepicker input.end').focus();
      });
    angular.element('#datepicker input.start').focus(function(){
        // angular.element('.label-change').text("Check-in date");
    });
    angular.element('#datepicker input.end').focus(function(){
        // angular.element('.label-change').text("Check-out date");
    });

    // Mobi scroll settings
     var endDate = new Date();
    endDate = new Date(endDate.setDate(endDate.getDate() + 21));
    // $scope.myrange=[starttDate, enddDate];
    $scope.settings = {
        theme: 'mobiscroll',
        dateFormat: 'M dd, yy',
        rangeTap: true,
        min: new Date(),
    };
}]);
