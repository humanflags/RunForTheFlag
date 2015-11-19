/*jslint sloppy:true, browser:true, devel:true, white:true, vars:true, eqeq:true, nomen:true, unparam:true */
/*global intel, google, Marker, device */



var _map = null;
var myLatLng;
var marker = null;
var canvas = null;
var runImage = null;
var allPlayers;
var markers;
//Create the google Maps and LatLng object 

var options = {
    timeout: 10000,
    maximumAge: 11000,
    enableHighAccuracy: true
};

var xmlhttp;
//Success callback
var suc = function(p) {
    myLatLng = new google.maps.LatLng(p.coords.latitude, p.coords.longitude);
    //_map.setZoom(12);
    marker.setPosition(myLatLng);
    //_map.panTo(myLatLng);
    
    
        var values = { "id":device.uuid , "latitude":p.coords.latitude.toString() , "longitude":p.coords.longitude.toString()};

        //console.log(values);
    
        xmlhttp = new XMLHttpRequest();

        var myJsonString = JSON.stringify(values);
        xmlhttp.onreadystatechange = respond;
        xmlhttp.open("POST", "http://c2566756-0.web-hosting.es/position.php", true);
        xmlhttp.setRequestHeader("Content-type", "application/json");
        xmlhttp.send(myJsonString);
};

function getPlayers()
{
 
    var others;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = playersIncoming;
    xmlhttp.open("GET", "http://c2566756-0.web-hosting.es/playerlocations.php", true);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();
    
}

function playersIncoming()
{
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        allPlayers = JSON.parse(xmlhttp.responseText);
        var i=allPlayers.length;
        var actualBounds = new google.maps.LatLngBounds();
        //console.log("There are "+i+" players");
        var x=0;
        for (x=0;x<i;x++)
        {
            if (allPlayers[x].latitude.length!==0){
                
                //console.log(x+"--->"+allPlayers[x].latitude+"-"+allPlayers[x].longitude);
                //console.log("x:"+minx+" y:"+miny+" x:"+maxx+" y:"+maxy);

                var playerLatLng = new google.maps.LatLng(allPlayers[x].latitude,allPlayers[x].longitude);
                actualBounds.extend(playerLatLng);
                if (allPlayers[x].id!=device.uuid){
                    //console.log("Player "+x+" lat "+allPlayers[x].latitude+" long "+allPlayers[x].longitude);

                    var markerOptions = {
                        position:playerLatLng,
                        map: _map
                    };
                    new google.maps.Marker(markerOptions);
                }
            }
        }
        _map.fitBounds(actualBounds);
        _map.panToBounds(actualBounds);
        //_map.animateCamera(google.CameraUpdateFactory.newLatLngZoom(actualBounds.center, actualBounds.zoom));
    }
}

function respond() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        //console.log(xmlhttp.responseText);
    }
}

//Failed callback
var fail = function() {
        console.log("Geolocation failed. \nPlease enable GPS in Settings.", 1);
};

var i=0;
var ctx1;
var appearInterval;

function appear()
{
    
    var ample = 7 * window.innerWidth/15;
    var alt = 7 * window.innerHeight/9;
    ctx1.clearRect(i-200/*window.innerWidth/2-ample/2*/,0,ample,alt);
    i=i+10;
    ctx1.drawImage(runImage,i-200/*window.innerWidth/2-ample/2*/,0,ample,alt);

    if (i-200>=window.innerWidth){
        clearInterval(appearInterval);
    }
}

//Drawing function
function draw()
{
        try{
        var runImage =  new Image();
        runImage.src="images/intro.png";
        runImage.onload = function(){
            i=0;
            ctx1 = canvas.getContext("2d");
            appearInterval=setInterval(appear,5000);
            console.log("SI!");
        };
        
    }catch (e) {
        console.log("No puedo pintar");
    }
}



function onDeviceReady() {


    if (navigator.geolocation !== null) {
        
        // Drawing initial world map
        var mapOptions = {
            center: new google.maps.LatLng("41.075",  "1.1249"),
            zoom:1,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoomControl: false,
            disableDefaultUI:true,
            disableDoubleClickZoom:true,
            draggable:true
        };
        _map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
        
        // Drawing my position
        var markerOptions = {
                position:new google.maps.LatLng("41.075",  "1.1249"),
                map: _map
            };
        marker = new google.maps.Marker(markerOptions);

        
        // Initiate location pooling
        try {
            navigator.geolocation.watchPosition(suc, fail, options);
        }catch (e) {
            alert(e.message);
        }
        
        // Initiate other players location
        setInterval(getPlayers,5000);
    }
    
    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style['z-index'] = 999;
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    document.body.appendChild(canvas);
    
    runImage =  new Image();
    runImage.src="images/intro.png";
    runImage.onload = function(){
            ctx1 = canvas.getContext("2d");
            appearInterval=setInterval(appear,40);
    };

    

    
}


// Execution
document.addEventListener("deviceready", onDeviceReady);


