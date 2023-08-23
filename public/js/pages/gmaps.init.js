var map;
document.addEventListener("DOMContentLoaded", function (event) {
    // Markers
    map = new GMaps({
        div: '#gmaps-markers',
        lat: -12.043333,
        lng: -77.028333
    });
    map.addMarker({
        lat: -12.043333,
        lng: -77.03,
        title: 'Lima',
        details: {
            database_id: 42,
            author: 'HPNeo'
        },
        click: function (e) {
            if (console.log)
                console.log(e);
            alert('You clicked in this marker');
        }
    });
});