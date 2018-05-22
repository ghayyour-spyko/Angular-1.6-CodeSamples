app.controller('faqController', ['$scope', '$rootScope', function($scope, $rootScope) {
    console.log("In faq controller");
    $rootScope.headerClass = false;
    jQuery('#sidebar').theiaStickySidebar({
        additionalMarginTop: 50
    });

    function toggleIcon(e) {
        $(e.target)
            .prev('.panel-heading')
            .find(".indicator")
            .toggleClass('icon-plus icon-minus');
    }
    $('.panel-group').on('hidden.bs.collapse', toggleIcon);
    $('.panel-group').on('shown.bs.collapse', toggleIcon);

    angular.element('#faq_box a[href*=#]:not([href=#])').click(function(e) {
        e.preventDefault();
        // if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
        console.log('in this loop');
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        if (target.length) {
            $('html,body').animate({
                scrollTop: target.offset().top - 50
            }, 500);
            return false;
        }
        // }
    });
}]);