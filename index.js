let local = false;
let local_because_api_failed = false;
let theme = "light";
let ms = 0;
let normal_color = "";

function alert_banner(text) {
    document.getElementById("alert-banner-text").innerHTML = text;
    document.getElementById("alert-banner").style.display = "flex";
    setTimeout(function () {
        document.getElementById("alert-banner").style.display = "none";
    }, 5000);
}

function padZone(num) {
    if (num >= 0) {
        return "+" + num.toString().padStart(2, "0");
    } else {
        return "-" + num.toString().padStart(2, "0");
    }
}

function switch_source() {
    if (local === true) {
        local_because_api_failed = false;
    }

    local = !local;



    document.getElementById("source").classList.add("no-after");


    if (local === true) {
        document.getElementById("source").innerHTML = "source: new Date();";
    } else {
        document.getElementById("source").innerHTML = "source: worldtimeapi.org";
    }

    getTime();
}

function toggleTheme() {
    console.log("theme");

    document.body.classList.remove("dark-emergency");
    if (theme === "light") {
        theme = "dark";
        document.getElementById("checker-actual").checked = true;
        normal_color = "black";
    } else {
        theme = "light";
        normal_color = "white";

    }

    normal_color = document.body.style.getPropertyValue('--text-color');

    document.body.classList.toggle("dark-mode");

    // save theme in local storage
    setCookie("theme", theme);
}

function local_get() {
    console.log("local_get() called");

    if (local_because_api_failed === true) {
        api_attempts++;
    }

    if (api_attempts > 100 && local_because_api_failed === true) {
        local = false;
        local_because_api_failed = false;
        api_attempts = 0;
        getTime();
    }

    console.log("Switching to local time")
    let date = new Date();
    let year = date.getFullYear().toString().padStart(2, "0");
    let month = (date.getMonth() + 1).toString().padStart(2, "0");
    let day = date.getDate().toString().padStart(2, "0");

    let hour = date.getHours().toString().padStart(2, "0");
    let min = date.getMinutes().toString().padStart(2, "0");
    let sec = date.getSeconds().toString().padStart(2, "0");
    let ms = date.getMilliseconds().toString().padStart(2, "0").slice(0, 2);

    document.getElementById("date").innerHTML = day + "/" + month + "/" + year;
    document.getElementById("hr").innerHTML = hour + ":";
    document.getElementById("min").innerHTML = min + ":";
    document.getElementById("sec").innerHTML = sec;
    document.getElementById("ms").innerHTML = "." + ms;

    let offset = date.getTimezoneOffset();
    let zone_name = Intl.DateTimeFormat().resolvedOptions().timeZone;

    let offsetFormatted = `${padZone(offset / 60)}:${(offset % 60).toString().padStart(2, "0")}`;

    document.getElementById("zone").innerHTML = `${zone_name} (UTC${offsetFormatted})`;

    document.getElementById("utc-time").innerHTML = `UTC ${date.getUTCHours().toString().padStart(2, "0").slice(0, 2)}:${date.getUTCMinutes().toString().padStart(2, "0").slice(0, 2)}:${date.getUTCSeconds().toString().padStart(2, "0").slice(0, 2)}`.trim();

    document.getElementById("utc-ms").innerText = "." + date.getUTCMilliseconds().toString().padStart(2, "0").slice(0, 2);
    document.getElementById("source").innerHTML = "source: new Date();";

    document.title = `${hour}:${min}:${sec} ${offsetFormatted}`;
}

let api_attempts = 0;
let displayed = false;

function ensure_ms() {
    ms = parseInt(ms.toString().padStart(2, "0").slice(0, 2));
}

let colors = {
    aqua: [0, 255, 255],
    blue: [0, 0, 255],
    cyan: [0, 255, 255],
    gold: [255, 215, 0],
    indigo: [75, 0, 130],
    lime: [0, 255, 0],
    magenta: [255, 0, 255],
    orange: [255, 165, 0],
    purple: [128, 0, 128],
    red: [255, 0, 0],
    silver: [192, 192, 192],
    teal: [0, 128, 128],
    violet: [238, 130, 238],
    yellow: [255, 255, 0],
};

function getTime() {
    let zone_name = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (local === true) {
        local_get();
    } else {
        let start_time = new Date().getTime();
        const response = fetch(`https://worldtimeapi.org/api/timezone/${zone_name}`, Headers = {
            "Accept": "application/json",
            "Access-Control-Allow-Origin": "*"
        })
            .then(response => response.json())
            .then(data => {
                console.log("API call successful");
                let end_time = new Date().getTime();

                let offset = data.utc_offset;
                let utcTime = data.utc_datetime;

                let date_string = data.datetime;

                let zone = offset.substring(0, 3);

                let offsetMinutes = offset.substring(4);
                let offsetFormatted = `${zone}:${offsetMinutes}`;

                document.getElementById("zone").innerHTML = `${zone_name} (UTC${offsetFormatted})`;

                let year = date_string.substring(0, 4);
                let month = date_string.substring(5, 7);
                let day = date_string.substring(8, 10);

                let hour = date_string.substring(11, 13);
                let min = date_string.substring(14, 16);
                let sec = date_string.substring(17, 19);
                ms = parseInt(date_string.substring(20, 22));

                let round_trip_time = end_time - start_time;

                if ((ms + (round_trip_time / 10)) > 100) {
                    alert_banner("API is slow, switching to local time");
                    local = true;
                    local_because_api_failed = true;
                    local_get();
                    return;
                } else {
                    ms += round_trip_time;
                }

                ensure_ms();

                document.getElementById("utc-time").innerHTML = `UTC ${utcTime.substring(11, 13).padStart(2, "0").slice(0, 2)}:${utcTime.substring(14, 16).padStart(2, "0").slice(0, 2)}:${utcTime.substring(17, 19).padStart(2, "0").slice(0, 2)}`.trim();

                document.getElementById("utc-ms").innerText = "." + parseInt(utcTime.substring(20, 22).padStart(2, "0").slice(0, 2)) % 100;

                document.getElementById("date").innerHTML = day + "/" + month + "/" + year;
                document.getElementById("hr").innerHTML = hour + ":";
                document.getElementById("min").innerHTML = min + ":";
                document.getElementById("sec").innerHTML = sec;
                document.getElementById("ms").innerHTML = "." + ms;
                document.getElementById("source").innerHTML = "source: worldtimeapi.org";

                document.title = `${hour}:${min}:${sec} ${offsetFormatted}`
            })
            .catch(error => {
                if (local === false && !displayed) {
                    alert_banner("API failed, switching to local time");
                    displayed = true;
                }
                local = true;
                local_because_api_failed = true;

                local_get();
            });
    }


    document.addEventListener("keydown", function (event) {
        switch (event.key) {
            case "l":
                local = !local;
                switch_source();
                break;

            case "t":
                toggleTheme();
                break;

            case "n":
                document.body.style.setProperty('--text-color', normal_color);
                setCookie("color", normal_color);
                break;

            default:
                for (let color of Object.keys(colors)) {
                    console.log(color);
                    if (event.key === color[0]) {

                        console.log("Changing color to " + color);

                        document.body.style.setProperty('--text-color', `rgb(${Math.round(colors[color][0])}, ${Math.round(colors[color][1])}, ${Math.round(colors[color][2])})`)

                        setCookie("color", color);

                    }
                };



        }
    });


}

function updateMs() {
    ensure_ms();

    ms++;

    document.getElementById("ms").innerHTML = "." + (ms % 100).toString().padStart(2, "0");

    document.getElementById("utc-ms").innerText = "." + (ms % 100).toString().padStart(2, "0");
}

function setCookie(key, value) {
    document.cookie = `${key}=${value}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
}

function getCookie(key) {
    let cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        let [name, value] = cookie.split("=");
        if (name === key) {
            return value;
        }
    }
    return null;
}

getTime();
setInterval(getTime, 1000);

updateMs();
setInterval(updateMs, 10);

document.addEventListener("DOMContentLoaded", function () {
    // get theme from local storage
    theme = getCookie("theme");
    if (theme === null) {
        theme = "light";
    }

    if (theme === "dark") {
        document.body.classList.add("dark-emergency");
    }
    document.body.classList.toggle("dark-mode", theme === "dark");

    // set the toggle switch to the correct position
    document.getElementById("checker-actual").checked = theme === "dark";


    // get color from local storage
    let color = getCookie("color");
    if (color === null) {
        color = "white";
    }

    document.body.style.setProperty('--text-color', `rgb(${Math.round(colors[color][0])}, ${Math.round(colors[color][1])}, ${Math.round(colors[color][2])})`);

});