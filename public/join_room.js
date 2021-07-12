const joinMeeting = () =>{
let url = document.getElementById("meeting-number").value;
location.replace(url);
}

const joinchat = () =>{
let url = document.getElementById("meeting-number").value;
if (url != ''){
text1 = url.substring(0, url.lastIndexOf('/'));
text2 = url.substring(url.lastIndexOf('/'));
url = text1 + "/before_call" + text2 + "abcdefgh";
location.replace(url);}
};