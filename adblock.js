console.log('adblock.js loaded');

(function () {
    const SCRIPT_ID = new URLSearchParams(window.location.search).get('id') || "default";
    // Окремий ключ для адблок перевірки (не плутати з bypass ключем)
    const ADBLOCK_KEY = "adblock_ok_" + SCRIPT_ID;

    // Завжди перевіряємо — скидаємо попередній результат
    sessionStorage.removeItem(ADBLOCK_KEY);

    document.body.style.visibility = 'hidden';

    var blocked = false;

    function blockPage() {
        if (blocked) return;
        blocked = true;
        document.body.style.visibility = 'visible';
        document.body.innerHTML = `
            <div style="
                display:flex;flex-direction:column;align-items:center;
                justify-content:center;min-height:100vh;
                background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
                color:white;font-family:'Segoe UI',sans-serif;
                text-align:center;padding:20px;
            ">
                <div style="font-size:80px;margin-bottom:20px;">🚫</div>
                <h1 style="font-size:32px;margin-bottom:15px;">Please Disable AdBlock</h1>
                <p style="font-size:16px;opacity:0.9;margin-bottom:30px;max-width:400px;">
                    We detected that you're using an ad blocker.<br>
                    Please disable it and refresh the page to continue.
                </p>
                <button onclick="location.reload()" style="
                    padding:18px 45px;font-size:18px;background:white;
                    color:#667eea;border:none;border-radius:50px;cursor:pointer;
                    font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,0.3);
                ">🔄 Refresh Page</button>
            </div>
        `;
    }

    function allowPage() {
        if (!blocked) {
            sessionStorage.setItem(ADBLOCK_KEY, "true");
            document.body.style.visibility = 'visible';
        }
    }

    var xhr = new XMLHttpRequest();
    var startTime = Date.now();

    xhr.open('GET', 'https://dcbbwymp1bhlf.cloudfront.net/?wbbcd=1253824&t=' + Date.now(), true);
    xhr.timeout = 5000;

    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;

        var elapsed = Date.now() - startTime;
        console.log('XHR status=' + xhr.status + ' elapsed=' + elapsed + 'ms');

        if (xhr.status === 0) {
            if (elapsed < 200) {
                blockPage();
            } else {
                allowPage();
            }
        } else {
            allowPage();
        }
    };

    xhr.ontimeout = function () {
        allowPage();
    };

    xhr.send();

    setTimeout(function () {
        if (!blocked) allowPage();
    }, 6000);

})();
