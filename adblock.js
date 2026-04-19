(function () {
    const SCRIPT_ID = new URLSearchParams(window.location.search).get('id') || "default";
    const STORAGE_KEY = "ad_passed_" + SCRIPT_ID;

    if (sessionStorage.getItem(STORAGE_KEY) === "true") return;

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
            document.body.style.visibility = 'visible';
        }
    }

    // Завантажуємо файл-приманку ads.js з нашого репо
    // AdBlock блокує його бо він називається "ads.js"
    // Якщо завантажився — window._adsLoaded = true
    // Якщо заблокований — залишається undefined
    var script = document.createElement('script');
    script.src = 'ads.js?t=' + Date.now();

    script.onload = function () {
        // Файл завантажився — AdBlock не активний
        allowPage();
    };

    script.onerror = function () {
        // Файл заблокований — AdBlock активний
        blockPage();
    };

    document.head.appendChild(script);

    // Fallback — якщо скрипт завис
    setTimeout(function () {
        if (!blocked) {
            allowPage();
        }
    }, 3000);

})();
