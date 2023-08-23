var options = {
    series: [
        {
            name: "One",
            data: [44],
        },
        {
            name: "Two",
            data: [53],
        },
        {
            name: "Three",
            data: [12],
        },
        {
            name: "Four",
            data: [9],
        },
        {
            name: "Five",
            data: [25],
        },
    ],
    chart: {
        type: "bar",
        height: 80,
        stacked: true,
        stackType: "100%",
        toolbar: {
            show: false,
        },
    },
    colors: ['#30A970', '#FFC109', '#318EF4', '#D81960', '#9A27AE'],
    plotOptions: {
        bar: {
            horizontal: true,
        },
    },
    yaxis: {
        show: false,
    },
    xaxis: {
        categories: [2008, 2009, 2010, 2011, 2012, 2013, 2014],
        labels: {
            show: false,
        },
        axisBorder: {
            show: false,
        },
        axisTicks: {
            show: false,
        },
    },
    dataLabels: {
        enabled: false,
    },
    stroke: {
        show: false,
    },
    fill: {
        opacity: 1,
    },
    legend: {
        show: false,
    },
};

var chart = new ApexCharts(document.querySelector("#satisfaction"), options);
chart.render();

var options = {
    series: [
        {
            name: "One",
            data: [44],
        },
        {
            name: "Two",
            data: [53],
        },
        {
            name: "Three",
            data: [12],
        },
        {
            name: "Four",
            data: [9],
        },
        {
            name: "Five",
            data: [25],
        },
    ],
    chart: {
        type: "bar",
        height: 80,
        stacked: true,
        stackType: "100%",
        toolbar: {
            show: false,
        },
    },
    colors: ['#30A970', '#FFC109', '#318EF4', '#D81960', '#9A27AE'],
    plotOptions: {
        bar: {
            horizontal: true,
        },
    },
    yaxis: {
        show: false,
    },
    xaxis: {
        categories: [2008, 2009, 2010, 2011, 2012, 2013, 2014],
        labels: {
            show: false,
        },
        axisBorder: {
            show: false,
        },
        axisTicks: {
            show: false,
        },
    },
    dataLabels: {
        enabled: false,
    },
    stroke: {
        show: false,
    },
    fill: {
        opacity: 1,
    },
    legend: {
        show: false,
    },
};

var chart = new ApexCharts(document.querySelector("#reflection"), options);
chart.render();

var options = {
    series: [
        {
            name: "One",
            data: [44],
        },
        {
            name: "Two",
            data: [53],
        },
        {
            name: "Three",
            data: [12],
        },
        {
            name: "Four",
            data: [9],
        },
        {
            name: "Five",
            data: [25],
        },
    ],
    chart: {
        type: "bar",
        height: 80,
        stacked: true,
        stackType: "100%",
        toolbar: {
            show: false,
        },
    },
    colors: ['#30A970', '#FFC109', '#318EF4', '#D81960', '#9A27AE'],
    plotOptions: {
        bar: {
            horizontal: true,
        },
    },
    yaxis: {
        show: false,
    },
    xaxis: {
        categories: [2008, 2009, 2010, 2011, 2012, 2013, 2014],
        labels: {
            show: false,
        },
        axisBorder: {
            show: false,
        },
        axisTicks: {
            show: false,
        },
    },
    dataLabels: {
        enabled: false,
    },
    stroke: {
        show: false,
    },
    fill: {
        opacity: 1,
    },
    legend: {
        show: false,
    },
};

var chart = new ApexCharts(document.querySelector("#outcomes"), options);
chart.render();


var options = {
    series: [
        {
            data: [55, 30, 50, 75],
        },
    ],
    chart: {
        type: "bar",
        toolbar: {
            show: false,
        },
        height: 373,
    },
    colors: ["#30A970", "#FFC109", "#318EF4", "#D81960", "#9A27AE"],
    plotOptions: {
        bar: {
            columnWidth: '25%',
            horizontal: true,
            distributed: true,
        },
    },
    legend: {
        show: false,
    },
    dataLabels: {
        enabled: false,
    },
    xaxis: {
        categories: ["Satisfaction", "Reflection", "Empathy", "Self Confidence"],
        labels: {
            show: false,
        },
        axisTicks: {
            show: false,
        },
        axisBorder: {
            show: false,
        },
        grid: {
            show: true,
            xaxis: {
                lines: {
                    show: true,
                },
            },
            yaxis: {
                lines: {
                    show: false,
                },
            },
            padding: {
                top: 0,
                right: -2,
                bottom: 15,
                left: 10,
            },
        },
    },
    yaxis: {
        show: false,
    },
};

var chart = new ApexCharts(document.querySelector("#chart2"), options);
chart.render();




function getChartColorsArray(chartId) {
    if (document.getElementById(chartId) !== null) {
        var colors = document.getElementById(chartId).getAttribute("data-colors");
        colors = JSON.parse(colors);
        return colors.map(function (value) {
            var newValue = value.replace(" ", "");
            if (newValue.indexOf(",") === -1) {
                var color = getComputedStyle(document.documentElement).getPropertyValue(
                    newValue
                );
                if (color) return color;
                else return newValue;
            } else {
                var val = value.split(",");
                if (val.length == 2) {
                    var rgbaColor = getComputedStyle(
                        document.documentElement
                    ).getPropertyValue(val[0]);
                    rgbaColor = "rgba(" + rgbaColor + "," + val[1] + ")";
                    return rgbaColor;
                } else {
                    return newValue;
                }
            }
        });
    }
}

var linechartcustomerColors = getChartColorsArray("chart1");
var options = {
    series: [{
            name: "Satisfaction",
            type: "area",
            data: [34, 65, 46, 68, 49, 61, 42, 44, 78, 52, 63, 67],
        }, {
            name: "Reflection",
            type: "bar",
            data: [ 89, 98, 68, 108, 77, 84, 51, 28, 92, 42, 88, 36],
        }, {
            name: "Empathy",
            type: "line",
            data: [30, 12, 7, 17, 21, 11, 5, 9, 7, 29, 12, 35],
        }
    ],
    chart: {
        height: 370,
        type: "line",
        toolbar: {
            show: false,
        }
    },
    stroke: {
        curve: "straight",
        dashArray: [0, 0, 8],
        width: [2, 0, 2.2],
    },
    fill: {
        opacity: [0.1, 0.9, 1],
    },
    markers: {
        size: [0, 0, 0],
        strokeWidth: 2,
        hover: {
            size: 4,
        },
    },
    xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        axisTicks: {
            show: false,
        },
        axisBorder: {
            show: false,
        },
    },
    grid: {
        show: true,
        xaxis: {
            lines: {
                show: true,
            },
        },
        yaxis: {
            lines: {
                show: false,
            },
        },
        padding: {
            top: 0,
            right: -2,
            bottom: 15,
            left: 10,
        },
    },
    legend: {
        show: true,
        horizontalAlign: "center",
        offsetX: 0,
        offsetY: -5,
        markers: {
            width: 9,
            height: 9,
            radius: 6,
        },
        itemMargin: {
            horizontal: 10,
            vertical: 0,
        },
    },
    plotOptions: {
        bar: {
            columnWidth: "30%",
            barHeight: "70%",
        },
    },
    colors: linechartcustomerColors,
    tooltip: {
        shared: true,
        y: [{
                formatter: function (y) {
                    if (typeof y !== "undefined") {
                        return y.toFixed(0);
                    }
                    return y;
                },
            },
            {
                formatter: function (y) {
                    if (typeof y !== "undefined") {
                        return "$" + y.toFixed(2) + "k";
                    }
                    return y;
                },
            },
            {
                formatter: function (y) {
                    if (typeof y !== "undefined") {
                        return y.toFixed(0) + " Sales";
                    }
                    return y;
                },
            },
        ],
    },
};
var chart = new ApexCharts(
    document.querySelector("#chart1"),
    options
);
chart.render();

// Simple Donut Charts
var chartDonutBasicColors = getChartColorsArray("store-visits-source");
var options = {
    series: [44, 55, 41, 17, 15],
    labels: ["Direct", "Social", "Email", "Other", "Referrals"],
    chart: {
        height: 333,
        type: "donut",
    },
    legend: {
        position: "bottom",
    },
    stroke: {
        show: false
    },
    dataLabels: {
        dropShadow: {
            enabled: false,
        },
    },
    colors: chartDonutBasicColors,
};

var chart = new ApexCharts(
    document.querySelector("#store-visits-source"),
    options
);
chart.render();

// world map with markers
var vectorMapWorldMarkersColors = getChartColorsArray("sales-by-locations");
var worldemapmarkers = new jsVectorMap({
    map: "world_merc",
    selector: "#sales-by-locations",
    zoomOnScroll: false,
    zoomButtons: false,
    selectedMarkers: [0, 5],
    regionStyle: {
        initial: {
            stroke: "#9599ad",
            strokeWidth: 0.25,
            fill: vectorMapWorldMarkersColors[0],
            fillOpacity: 1,
        },
    },
    markersSelectable: true,
    markers: [{
            name: "Palestine",
            coords: [31.9474, 35.2272],
        },
        {
            name: "Russia",
            coords: [61.524, 105.3188],
        },
        {
            name: "Canada",
            coords: [56.1304, -106.3468],
        },
        {
            name: "Greenland",
            coords: [71.7069, -42.6043],
        },
    ],
    markerStyle: {
        initial: {
            fill: vectorMapWorldMarkersColors[1],
        },
        selected: {
            fill: vectorMapWorldMarkersColors[2],
        },
    },
    labels: {
        markers: {
            render: function (marker) {
                return marker.name;
            },
        },
    },
});

// Vertical Swiper
var swiper = new Swiper(".vertical-swiper", {
    slidesPerView: 2,
    spaceBetween: 10,
    mousewheel: true,
    loop: true,
    direction: "vertical",
    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
    },
});

document.querySelectorAll(".layout-rightside-btn").forEach(function (item) {
    var userProfileSidebar = document.querySelector(".layout-rightside-col");
    item.addEventListener("click", function () {
        if (userProfileSidebar.classList.contains("d-block")) {
            userProfileSidebar.classList.remove("d-block");
            userProfileSidebar.classList.add("d-none");
        } else {
            userProfileSidebar.classList.remove("d-none");
            userProfileSidebar.classList.add("d-block");
        }
    });
});

window.addEventListener("resize", function () {
    var userProfileSidebar = document.querySelector(".layout-rightside-col");
    document.querySelectorAll(".layout-rightside-btn").forEach(function () {
        if (window.outerWidth < 1699 || window.outerWidth > 3440) {
            userProfileSidebar.classList.remove("d-block");
        } else if (window.outerWidth > 1699) {
            console.log("yesss");
            userProfileSidebar.classList.add("d-block");
        }
    });
});

document.querySelector(".overlay").addEventListener("click", function () {
    if (document.querySelector(".layout-rightside-col").classList.contains('d-block') == true) {
        document.querySelector(".layout-rightside-col").classList.remove("d-block");
    }
});

window.addEventListener("load", function () {
    var userProfileSidebar = document.querySelector(".layout-rightside-col");
    document.querySelectorAll(".layout-rightside-btn").forEach(function () {
        if (window.outerWidth < 1699 || window.outerWidth > 3440) {
            userProfileSidebar.classList.remove("d-block");
        } else if (window.outerWidth > 1699) {
            userProfileSidebar.classList.add("d-block");
        }
    });
});