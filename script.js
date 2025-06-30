document.getElementById('convert1.19').onclick = function() {
    let text = document.getElementById("pslink").value;
    const replacements = {
        "Twisted-Legacy": "1-19-1",
        "121437276722082": "78568440332100",
    };

    for (const [key, value] of Object.entries(replacements)) {
        text = text.replaceAll(key, value);
    }

    document.getElementById("fixedlink").innerText = text;
};

document.getElementById('convert1.18').onclick = function() {
    let text = document.getElementById("pslink").value;
    const replacements = {
        "Twisted-Legacy": "1-18-1",
        "121437276722082": "127382198965278",
    };

    for (const [key, value] of Object.entries(replacements)) {
        text = text.replaceAll(key, value);
    }

    document.getElementById("fixedlink").innerText = text;
};

document.getElementById('convert1.17').onclick = function() {
    let text = document.getElementById("pslink").value;
    const replacements = {
        "Twisted-Legacy": "1-17-1",
        "121437276722082": "72239019140762",
    };

    for (const [key, value] of Object.entries(replacements)) {
        text = text.replaceAll(key, value);
    }

    document.getElementById("fixedlink").innerText = text;
};

document.getElementById('convert1.16').onclick = function() {
    let text = document.getElementById("pslink").value;
    const replacements = {
        "Twisted-Legacy": "1-16-7",
        "121437276722082": "120815579005581",
    };

    for (const [key, value] of Object.entries(replacements)) {
        text = text.replaceAll(key, value);
    }

    document.getElementById("fixedlink").innerText = text;
};

document.getElementById('convert1.15').onclick = function() {
    let text = document.getElementById("pslink").value;
    const replacements = {
        "Twisted-Legacy": "1-15-3",
        "121437276722082": "133097500494936",
    };

    for (const [key, value] of Object.entries(replacements)) {
        text = text.replaceAll(key, value);
    }

    document.getElementById("fixedlink").innerText = text;
};

document.getElementById('convert1.14').onclick = function() {
    let text = document.getElementById("pslink").value;
    const replacements = {
        "Twisted-Legacy": "1-14-3",
        "121437276722082": "129811136412760",
    };

    for (const [key, value] of Object.entries(replacements)) {
        text = text.replaceAll(key, value);
    }

    document.getElementById("fixedlink").innerText = text;
};

document.getElementById('convert1.21').onclick = function() {
    let text = document.getElementById("pslink").value;
    const replacements = {
        "Twisted-BETA": "Twisted-MAIN",
        "6161235818": "14170731342",
    };

    for (const [key, value] of Object.entries(replacements)) {
        text = text.replaceAll(key, value);
    }

    document.getElementById("fixedlink").innerText = text;
};