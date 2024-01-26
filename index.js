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

let colors = [
    "aqua",
    "blue",
    "cyan",
    "green",
    "indigo",
    "magenta",
    "orange",
    "purple",
    "red",
    "silver",
    "violet",
    "yellow"
];

let date_obj = new Date();
let diff_from_server = 0;

setInterval(() => {
    date_obj = new Date((new Date()).getTime() + diff_from_server);
}, 10);

setInterval(() => {
    doWork().then((time) => {
        date_obj = new Date(time);
    });
}, 1000);


async function doLogic() {
    try {
        const response = await fetch('https://worldtimeapi.org/api/ip');
        const data = await response.json();
        const serverTime = new Date(Date.parse(data.datetime));
        const localTime = new Date();
        diff_from_server = serverTime.getTime() - localTime.getTime();
        return diff_from_server;
    }
    catch (e) {
        console.error(e);
        return diff_from_server;
    }
}

async function doWork() {
    let response = await doLogic();
    let date1 = new Date((new Date()).getTime() + response);
    return date1.getTime();
}

function getTime() {

    document.getElementById("date").innerHTML = date_obj.toLocaleDateString();
    document.getElementById("hr").innerHTML = date_obj.getHours().toString().padStart(2, "0") + ":";
    document.getElementById("min").innerHTML = date_obj.getMinutes().toString().padStart(2, "0") + ":";
    document.getElementById("sec").innerHTML = date_obj.getSeconds().toString().padStart(2, "0");
    document.getElementById("ms").innerHTML = "." + date_obj.getMilliseconds().toString().padStart(2, "0").slice(0, 2);

    let offset = date_obj.getTimezoneOffset();
    let zone_name = Intl.DateTimeFormat().resolvedOptions().timeZone;

    let offsetFormatted = `${padZone(offset / 60)}:${(offset % 60).toString().padStart(2, "0")}`;

    document.getElementById("zone").innerHTML = `${zone_name} (UTC${offsetFormatted})`;

    document.getElementById("utc-time").innerHTML = `UTC ${date_obj.getUTCHours().toString().padStart(2, "0").slice(0, 2)}:${date_obj.getUTCMinutes().toString().padStart(2, "0").slice(0, 2)}:${date_obj.getUTCSeconds().toString().padStart(2, "0").slice(0, 2)}`.trim();

    document.getElementById("utc-ms").innerText = "." + date_obj.getUTCMilliseconds().toString().padStart(2, "0").slice(0, 2);

    document.getElementById("source").innerHTML = "source: worldtimeapi.org";

    document.title = `${date_obj.getHours().toString().padStart(2, "0")}:${date_obj.getMinutes().toString().padStart(2, "0")}:${date_obj.getSeconds().toString().padStart(2, "0")} ${offsetFormatted}`;


    document.addEventListener("keyup", function (event) {
        if (event.key === "l") {
            console.log("Switcheroo")
            switch_source();
        }
    });


    document.addEventListener("keydown", function (event) {
        switch (event.key) {
            case "l":
                break;

            case "t":
                toggleTheme();
                break;

            case "n":
                document.body.style.setProperty('--text-color', normal_color);
                setCookie("color", normal_color);
                break;

            default:
                for (let color of colors) {
                    console.log(color);
                    if (event.key === color[0]) {

                        console.log("Changing color to " + color);

                        document.body.style.setProperty('--text-color', color);

                        setCookie("color", color);

                    }
                };
                break;
        }
    });
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
setInterval(getTime, 10);


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
        color = normal_color;
    }

    document.body.style.setProperty('--text-color', color);

});