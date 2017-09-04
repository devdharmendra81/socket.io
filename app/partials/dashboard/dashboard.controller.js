angular.module('creativeApp')
    .controller('DashboardController', DashboardController);

DashboardController.$inject = ['$scope', '$timeout', '$state', 'AppService', 'AuthService', 'socket', '$rootScope'];

function DashboardController($scope, $timeout, $state, AppService, AuthService, socket, $rootScope) {
    //variables
    $scope.username = AppService.getUsername();
    $scope.email = AppService.getEmail();
    $scope.copyrightDate = new Date().getFullYear();
    $scope.selectedArtist='';

    //methods declarations
    AppService.setPageTitle('Xcel Media Group | Creative Dashboard');
    $scope.logOut = logOut;
    $scope.mapQueueData = mapQueueData;
    $scope.mapApprovedQueueData = mapApprovedQueueData;
    $scope.mapOJPendingApprovalsData = mapOJPendingApprovalsData;
    $scope.mapliveProof = mapliveProof;
    $scope.mapActiveQueue = mapActiveQueue;
    $scope.mapPrizeBoard = mapPrizeBoard;
    $scope.filterArtist = filterArtist;
    $scope.removeFilter = removeFilter;
    $scope.setInCreative = setInCreative;
    $scope.getApproved = getApproved;
    $scope.backToQueue = backToQueue;
    $scope.approveJob = approveJob;
    $scope.sendToVendor = sendToVendor;

    //method definition
    function logOut() {
        AuthService.logout().then(function (response) {
            //disconnect socket on successful logout
            socket.emit('socket:end');
            $state.go('login');
        });
    }

    function mapQueueData(queueObj) {
        $scope.queueArray = queueObj;
    }

    function mapApprovedQueueData(approvedQueueObj) {
        $scope.approvedQueueArray = approvedQueueObj;
    }

    function mapliveProof(liveProofObj) {
        $scope.liveProofArray = liveProofObj;
    }

    function mapOJPendingApprovalsData(obj) {
        $scope.OJPendingApprovalsArray = obj;
    }

    function mapActiveQueue(obj) {
        $scope.activeQueueArray = obj;
    }

    function mapPrizeBoard(obj) {
        $scope.prizeArray = obj;
    }

    function filterArtist(item) {
        $scope.selectedArtist = item.Artist__c;
    }

    function removeFilter() {
        $scope.selectedArtist = '';
    }

    function setInCreative(queue) {
        var sf = {
            job : queue.Id,
            user : $scope.username,
            email : $scope.email,
            name : queue.Name
        };
        $rootScope.loadingImage = true;
        socket.emit('update_queue',sf);
    }

    function getApproved(obj) {
         var sf = {
             job : obj.Id,
             user : $scope.username,
             email : $scope.email,
             name : obj.Name
         };
         socket.emit('send_approval',sf);
         $rootScope.loadingImage = true;
    }

    function approveJob(obj) {
        var sf = {
            job : obj.Id,
            user : $scope.username,
            email : $scope.email,
            name : obj.Name
        };
        socket.emit('approve_queue',sf);
        $rootScope.loadingImage = true;
    }

    function backToQueue(obj, param) {
        var sf = {
            job : obj.Id,
            user : $scope.username,
            email : $scope.email,
            name : obj.Name
        };

        if(param === 'revise'){
            if(obj.Revision__c === null){
                //initialize to zero
                obj.Revision__c = 0;
            }
            sf["Revision__c"] = obj.Revision__c;
        }

        socket.emit('send_queue',sf);
        $rootScope.loadingImage = true;
    }

    function sendToVendor(job) {
        bootbox.prompt({
            title: "Please enter artwork link from dropbox",
            inputType: 'text',
            buttons: {
                confirm: {
                    label: 'Submit',
                    className: 'btn green btn-sm'
                },
                cancel: {
                    label: 'Cancel',
                    className: 'btn red btn-sm'
                }
            },
            callback: function (result) {
                if(!!result){
                    var sf = {
                        job : job.Id,
                        link: result,
                        user : $scope.username,
                        email : $scope.email,
                        name : job.Name
                    };
                    socket.emit('send_vendor',sf);
                    $scope.$apply(function () {
                        $rootScope.loadingImage = true;
                    });
                }
            }
        });

    }

    socket.emit('dashboard:getData');

    socket.on('dashboard:getData', function(data) {
        if(Object.keys(data).length === 0){
            location.reload();
            return;
        }
        $scope.$apply(function () {
            $scope.mapQueueData(data.queue);
            $scope.mapActiveQueue(data.active);
            $scope.mapApprovedQueueData(data.approved);
            $scope.mapOJPendingApprovalsData(data.pending_approval);
            $scope.mapliveProof(data.live_proof);
            $scope.mapPrizeBoard(data.prize_board);
            $rootScope.loadingImage = false;
        });
    });

    socket.on('response:error', function(data) {
        $scope.$apply(function () {
            $rootScope.loadingImage = false;
        });
        toastr.error(data.message);
    });

    //mandatory calls to the JQuery functions for toggle and other UI behaviours
    App.init();
    Layout.init();
    Demo.init();
    //to prevent from childnode errors
    $timeout(function () {
        QuickSidebar.init();
    });

}