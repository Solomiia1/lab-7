$(document).ready(function () {
    var socket = io.connect('http://localhost:5000');

    socket.on("receiveMessage", (arg) => {
        if(arg.success === true) {
            $("#message").val('');
            return;
        }
        $("#messages").val($("#messages").val() + '\n' + arg.message + '\n');
    });


    $("#submitMessage").click(function() {
        $("#messages").val($("#messages").val() + $("#message").val() + '\n');
        socket.emit('messageSent', $("#message").val());
    });
})
