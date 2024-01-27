let local = false;
let local_because_api_failed = false;
let theme = "light";
let ms = 0;
let normal_color = "";

function alert_banner(text, timeout = 5000) {
    document.getElementById("alert-banner-text").innerHTML = text;
    document.getElementById("alert-banner").style.display = "flex";
    setTimeout(() => {
        close_banner(text);
    }, timeout);
}

function close_banner(text) {
    if (document.getElementById("alert-banner-text").innerHTML === text) {
        document.getElementById("alert-banner").style.display = "none";
    }
}

function padZone(num) {
    if (num >= 0) {
        return "+" + num.toString().padStart(2, "0");
    } else {
        return "-" + num.toString().padStart(2, "0");
    }
}

function switch_source() {
    // if (local === true) {
    //     local_because_api_failed = false;
    // }

    local = !local;


    document.getElementById("source").classList.add("no-after");

    if (local === true) {
        document.getElementById("source").innerHTML = "source: new Date();";
        disallow_update();
    } else {
        document.getElementById("source").innerHTML = "source: worldtimeapi.org";
        allow_update();
    }

    getTime();
}



function toggleTheme() {
    console.log("theme");

    let old_normal = normal_color;

    document.body.classList.remove("emergency");
    if (theme === "light") {
        theme = "dark";
        document.getElementById("checker-actual").checked = true;
        normal_color = "white";
    } else {
        theme = "light";
        document.getElementById("checker-actual").checked = false;
        normal_color = "black";
    }

    document.body.classList.add(theme === "dark" ? "dark-mode" : "light-mode");
    document.body.classList.remove(theme === "dark" ? "light-mode" : "dark-mode");

    normal_color = theme === "dark" ? "white" : "black";


    let color = getCookie("color");
    if (color) {
        if (!((color == "white" && theme == "light") || (color == "black" && theme == "dark"))) {
            document.body.style.setProperty('--text-color', color);
        } else {
            setCookie("color", normal_color);
            document.body.style.setProperty('--text-color', normal_color);
        }
    } else {
        document.body.style.setProperty('--text-color', normal_color);
    }

    // save theme in local storage
    setCookie("theme", theme);
}

function local_get() {
    console.log("local_get() called");

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

    console.log("local == ", local);
}

let api_attempts = 0;
let displayed = false;


let colors = [
    "aqua",
    "blue",
    "cyan",
    "green",
    "indigo",
    "magenta",
    "purple",
    "red",
    "violet",
    "yellow"
];

let date_obj = new Date();
let diff_from_server = 0;

setInterval(() => {
    date_obj = new Date((new Date()).getTime() + diff_from_server);
    close_banner("Calibrating...", 100000);
}, 10);

let update_from_server = setInterval(() => {
    doWork().then((time) => {
        date_obj = new Date(time);
    });
}, 1000);

function allow_update() {
    update_from_server = setInterval(() => {
        doWork().then((time) => {
            date_obj = new Date(time);
        });
    }, 1000);
}

function disallow_update() {
    clearInterval(update_from_server);
    diff_from_server = 0;
}


async function doLogic() {
    try {
        const response = await fetch('https://worldtimeapi.org/api/ip');
        const data = await response.json();
        const server_time = new Date(Date.parse(data.datetime));
        const local_time = new Date();
        diff_from_server = server_time.getTime() - local_time.getTime();
        return diff_from_server;
    }
    catch (e) {
        console.error(e);
        return diff_from_server;
    }
}

async function doWork() {
    let response = await doLogic();
    console.log("successful request to server");
    let date1 = new Date((new Date()).getTime() + response);
    return date1.getTime();
}

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

        case "h":
            toggleHelp();
            break;

        case "t":
            toggleTheme();
            break;

        case "g":
            window.location.replace("https://github.com/werdl/timesite")
            break;

        case "x":
            let color = prompt("Enter a color (hex or name)");
            document.body.style.setProperty('--text-color', color);

            setCookie("color", color);
            console.log("color is ", color);
            break;

        case "n":
            document.body.style.setProperty('--text-color', normal_color);
            setCookie("color", normal_color);
            break;

        case "o":
            if (document.body.style.opacity === "0.25") {
                document.body.style.opacity = "1";
            } else {
                document.body.style.opacity = "0.25";
            }
            break;

        case "s":
            doWork().then((time) => {
                date_obj = new Date(time);
            });
            break;

        case "d":
            if (diff_from_server === 0) {
                if (local === true) {
                    alert_banner("You are using local time!");
                } else {
                    alert_banner("Your computer is exact!");
                }
            } else if (diff_from_server < 0) { // inverse, as it is the amount we have to add to the local time to get the server time
                alert_banner(`Your computer is ${diff_from_server}ms ahead of the server`);
            } else {
                alert_banner(`Your computer is ${diff_from_server}ms behind the server`);
            }
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

function getTime() {


    if (local === true) {
        local_get();
        console.log("go local");
        return;
    }

    if (!local && diff_from_server === 0) {
        alert_banner("Calibrating...");
    }

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



}


function setCookie(key, value) {
    console.log("setting cookie");
    document.cookie = `${key}=${value}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
    console.log(document.cookie);
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

function toggleHelp() {
    // if on help.html, go to index.html
    let paths = window.location.pathname.split("/");
    if (paths[paths.length - 1] === "help.html") {
        window.location.replace("index.html");
    } else {
        window.location.replace("help.html");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // get theme from local storage
    theme = getCookie("theme");
    if (theme === null) {
        theme = "light";
    }

    document.body.classList.add("emergency"); // this is to prevent the flash of light mode when the page loads

    document.body.classList.toggle("dark-mode", theme === "dark");

    // set the toggle switch to the correct position
    document.getElementById("checker-actual").checked = theme === "dark";

    normal_color = theme === "dark" ? "white" : "black";
    document.body.style.setProperty('--text-color', normal_color);
    console.log("normal color is ", normal_color);

    // get color from local storage
    let color = getCookie("color");
    console.log(color);
    if (color === null) {

        color = normal_color;
    }

    document.body.style.setProperty('--text-color', color);

});


getTime();
setInterval(getTime, 10);
