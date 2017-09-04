angular.module('creativeApp')
    .factory('socket', socket);

socket.$inject = ['ApiConstant'];

function socket(ApiConstant) {
    var socket, socketService = {};
    socket= io.connect(ApiConstant);

    var checkConnection = function(){
        if(!socket.connected){
            socket= io.connect(ApiConstant);
        }
    };

    var on = function(eventName, callback){
        checkConnection();
        socket.on(eventName, callback);
    };
    var emit = function(eventName, data) {
        checkConnection();
        socket.emit(eventName, data);
    };

    socketService.checkConnection =checkConnection;
    socketService.on = on;
    socketService.emit = emit;

    return socketService;
}