document.addEventListener('DOMContentLoaded', function() {
    // Toggle chat window
    document.querySelector('.chat-btn').addEventListener('click', function() {
        var chatWindow = document.getElementById('chat-window');
        if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
            chatWindow.style.display = 'block';
            chatWindow.style.width = '20%';
            document.getElementById('pdf-viewer').style.width = '40%';
            document.getElementById('blocklyDiv').style.width = '40%';
        } else {
            chatWindow.style.display = 'none';
            document.getElementById('pdf-viewer').removeAttribute("style");
            document.getElementById('blocklyDiv').removeAttribute("style");
        }
    });
});
